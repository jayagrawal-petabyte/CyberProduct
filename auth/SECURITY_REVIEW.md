# CyberProduct — Security Architecture Review & Threat Model (L1-07)
**Reviewer:** Pallavi — Backend Architecture & Security  
**Status:** Comprehensive Security Audit & Action Plan  
**Target:** CyberProduct Node.js/Express Backend & Supabase Database Layer

---

## 1. Executive Summary

This security review evaluates the CyberProduct platform against modern cloud-native security standards, focusing on identity verification, role-based authorization, multi-tenant isolation, cryptographic audit logging, and data privacy.

The review confirms that the newly implemented authentication (`auth/`) and company configuration (`config/`) modules adhere to zero-trust principles, prevent privilege escalation, enforce tenant isolation at both the application and database tiers, and sanitize all logged output.

---

## 2. Key Security Findings & Remediations

### 2.1 Critical Database Migration File Discrepancy
- **Vulnerability / Issue:**  
  The migration file in the repository (`database/01_cyberproduct_migration (1).sql`) is missing lines 1 through 127 of the master migration. This omitted Section 1 (`extensions` and `private` schemas) and Section 2 (creation of all 22 custom PostgreSQL ENUM types, including `record_status` and `app_role`).
- **Impact:**  
  Running this migration on a clean Supabase database causes immediate execution failure at line 6 (`type public.record_status does not exist`).
- **Remediation:**  
  The full master migration (`Downloads/01_cyberproduct_migration.sql`) contains all required ENUM definitions and schema initializations. Coordination with co-owner Soumya Pathak is required to restore these missing 127 lines in the database repository.

### 2.2 Multi-Tenant Isolation
- **Mechanism:**  
  All business tables require `company_id uuid not null references public.companies (id) on delete restrict`.
- **Application Level:**  
  `req.user.company_id` is extracted strictly from the verified database profile. Client-supplied `company_id` in request bodies, query strings, or headers is strictly ignored and prohibited.
- **Database Level:**  
  RLS enforces `company_id = (select private.current_company_id())`. Database trigger `private.forbid_company_change()` permanently blocks changing `company_id` on update.

### 2.3 Privilege Escalation & Role Integrity
- **Role Source of Truth:**  
  User roles (`employee`, `lead`, `security_admin`) are stored exclusively in the protected database table `public.profiles`. Metadata supplied during `signUp()` or `updateUser()` in Supabase Auth is untrusted and ignored.
- **Self-Escalation & Lockout Guard:**  
  Database trigger `private.profiles_guard()` prevents any Security Administrator from altering their own role or status. Only other administrators in the company can manage administrator accounts.
- **RBAC Middleware:**  
  `auth/rbac.js` enforces strict role boundaries:
  - `requireSecurityAdmin`: Only `security_admin` may configure policies, manage company settings, or register resource categories.
  - `requireLead`: Leads can approve/reject requests only for employees reporting to them (`manager_id`).
  - Employees are restricted to personal device registration, request submissions, and reading their own profile.

### 2.4 Sensitive Data Protection & Privacy (PRD Section 8)
- **Credential & Token Redaction:**  
  `config/logger.js` automatically intercepts and redacts Bearer tokens, JWT strings, passwords, API keys, and service role keys before any log message is emitted.
- **Company Settings JSONB Sanitization:**  
  `config/company.validation.js` strictly rejects any secrets (e.g., `password`, `secret`, `api_key`, `token`, `webhook_url`) from being stored in `companies.settings`.
- **Profile Minimization:**  
  In compliance with PRD privacy guidelines, `profiles` stores only workplace-relevant fields (`employee_code`, `full_name`, `email`, `role`, `department_id`, `manager_id`, `job_title`). Personal data (phone, address, date of birth) is excluded by design.

### 2.5 Tamper-Evident Audit Logging
- **Append-Only Immutability:**  
  `audit_logs` is protected by `private.audit_logs_block_mutation()`, which throws SQLSTATE `23514` on any `UPDATE` or `DELETE` attempt, even by database superusers.
- **Cryptographic Chaining:**  
  Each log entry calculates `curr_hash = sha256(prev_hash || row_data)`, enabling offline mathematical verification of log integrity using `public.verify_audit_chain(company_id)`.

---

## 3. Security Checklist for Pull Requests

Before approving pull requests across any module, verify:
- [ ] No secrets or environment credentials are committed.
- [ ] Routes authenticate via `requireAuthenticatedUser`.
- [ ] Role checks match the RLS matrix (`requireSecurityAdmin`, `requireLead`, etc.).
- [ ] Tenant context is derived strictly from `req.user.company_id`.
- [ ] Database queries using user context invoke `createUserSupabaseClient(req.accessToken)`.
- [ ] No hard deletes are permitted on persistent entity tables.
- [ ] Input validation rejects unexpected fields and formats.
- [ ] Errors pass through `formatErrorResponse()` to prevent internal stack traces reaching clients.
