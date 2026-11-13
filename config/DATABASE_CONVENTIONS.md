# CyberProduct — Database Schema Conventions & Migration Protocol (L1-02)
**Authors:** Pallavi & Soumya Pathak (Joint Database Ownership)  
**Status:** Approved Migration & Database Conventions  
**Primary Reference:** `CyberProduct_Supabase_Schema.docx` (18 Pages)

---

## 1. Joint Ownership & Coordination Protocol

The `database/` folder and all PostgreSQL schema migrations are **jointly owned by Pallavi and Soumya Pathak**.

### Strict Operational Rules
1. **Never overwrite existing migration files.**
2. **Never execute ad-hoc, untracked DDL directly on the live Supabase database.**
3. **Coordinated Migrations:** Any new table, column, enum value, trigger, or index must be proposed with:
   - Specific Business Purpose & PRD Traceability.
   - Exact SQL statements using idempotent constructs (`IF NOT EXISTS`, `CREATE OR REPLACE`).
   - Impact assessment on dependent modules.
   - Explicit sign-off between Pallavi and Soumya Pathak before merging.
4. **Validation Scripts:** Every major migration must be accompanied by an automated rollback validation script (analogous to `02_cyberproduct_validation.sql`).

---

## 2. Table Ownership Matrix (All 17 Tables)

| # | Table Name | Workstream Owner | Associated Module | Purpose & Scope |
|---|---|---|---|---|
| 1 | `companies` | **Pallavi** | `config/` | Multi-tenant root. Holds company metadata, settings, policy version. |
| 2 | `departments` | **Vasu Moradiya** | `users/` | Department definitions within a company. Defines lead approval scope. |
| 3 | `profiles` | **Vasu Moradiya** | `users/` | Extends `auth.users`. Stores role (`employee`, `lead`, `security_admin`), manager, and active status. |
| 4 | `approval_delegations` | **Swetha M** | `approvals/` | Temporary delegation of approval authority from a lead to a designated peer. |
| 5 | `devices` | **Vasu Moradiya** | `devices/` | Registered hardware endpoints with compliance and trust states. |
| 6 | `corporate_networks` | **Soumya Pathak** | `access-engine/`, `integrations/` | Whitelisted or blacklisted network definitions (CIDR, VPN gateway, SSID). |
| 7 | `device_network_checks` | **Soumya Pathak** | `access-engine/`, `integrations/` | Append-only history of network compliance verifications per device. |
| 8 | `resource_categories` | **Aum Jalodara** | `resources/` | Logical grouping for protected resources (e.g., Finance, Source Code, Social Media). |
| 9 | `resources` | **Aum Jalodara** | `resources/` | Restricted websites, APIs, and enterprise applications. |
| 10 | `policies` | **Aum Jalodara** | `policies/` | Declarative access control rules (ALLOW, BLOCK, REQUIRES_APPROVAL). |
| 11 | `access_requests` | **Swetha M** | `access-requests/` | Employee access requests with approval state machine. |
| 12 | `access_grants` | **Swetha M** | `access-requests/`, `approvals/` | Time-bounded active access authorizations resulting from approved requests. |
| 13 | `access_decisions` | **Soumya Pathak** | `access-engine/` | Immutable log of engine evaluations per access attempt. |
| 14 | `access_sessions` | **Soumya Pathak** | `access-engine/` | Live active employee sessions with heartbeat tracking. |
| 15 | `audit_logs` | **Biplav Rout** | `security-events/` | Cryptographically chained (`sha256`), tamper-evident append-only security log. |
| 16 | `alerts` | **Biplav Rout** | `security-events/` | Incident alerts generated from violations and anomalies. |
| 17 | `notifications` | **Biplav Rout** | `security-events/` | Multi-channel dispatch outbox (in-app, email, Slack). |

---

## 3. SQL Naming & Schema Standards

1. **Schemas:**
   - `public`: Holds all business data tables and custom ENUM types exposed to the application.
   - `private`: Non-exposed schema for internal helper functions, security definer triggers, and audit hash calculation. Not exposed to PostgREST.
   - `extensions`: Dedicated schema for PostgreSQL extensions (e.g., `pg_trgm`).

2. **Identifiers:**
   - Table and column names must be `snake_case`.
   - Primary keys must be named `id` and typed `uuid` with `default gen_random_uuid()`.
   - Foreign keys must be named `<singular_table>_id` (e.g., `company_id`, `requester_id`).
   - Timestamps must be typed `timestamptz` with `default now()` for creation timestamps.
   - Boolean columns must use `is_` or `require_` prefixes (e.g., `is_active`, `require_compliant_device`).

3. **Multi-Tenant Isolation Rule (CRITICAL):**
   - Every business data table (tables 2 through 17) **MUST** include:
     ```sql
     company_id uuid not null references public.companies (id) on delete restrict
     ```
   - No row may exist without an explicit company assignment.
   - `company_id` is stamped automatically from session context via `private.set_company_from_session()` and is immutable via `private.forbid_company_change()`.

---

## 4. Custom PostgreSQL ENUM Types (22 Total)

The schema defines exactly 22 custom ENUM types:

| ENUM Name | Permitted Values | Stated Business Meaning |
|---|---|---|
| `record_status` | `active`, `inactive` | General lifecycle status for companies, categories, resources |
| `app_role` | `employee`, `lead`, `security_admin` | Application RBAC roles |
| `user_status` | `active`, `suspended`, `deactivated` | User account lifecycle state |
| `device_type` | `laptop`, `desktop`, `mobile`, `tablet`, `other` | Registered device classification |
| `device_status` | `pending`, `active`, `revoked` | Device authorization state |
| `compliance_status` | `compliant`, `non_compliant`, `unknown` | Posture check evaluation |
| `network_type` | `cidr`, `vpn_gateway`, `ssid` | Corporate network identifier |
| `resource_type` | `website`, `application`, `other` | Target resource category |
| `sensitivity_level` | `low`, `medium`, `high`, `critical` | Resource data classification |
| `policy_effect` | `ALLOW`, `BLOCK`, `REQUIRES_APPROVAL` | Core policy outcome |
| `policy_status` | `draft`, `active`, `archived` | Policy rule lifecycle |
| `request_status` | `pending`, `approved`, `rejected`, `expired`, `cancelled` | Access request state machine |
| `grant_status` | `active`, `expired`, `revoked` | Access grant validity |
| `decision_outcome` | `ALLOW`, `BLOCK`, `REQUIRES_APPROVAL` | Access engine evaluation result |
| `session_status` | `active`, `ended` | Live access session state |
| `session_end_reason` | `grant_expired`, `grant_revoked`, `device_revoked`, `user_deactivated`, `manual`, `timeout` | Reason for session termination |
| `audit_outcome` | `success`, `failure`, `denied` | Result of audited operation |
| `alert_type` | `security_alert`, `policy_violation`, `network_violation`, `suspicious_activity` | Incident classification |
| `alert_severity` | `low`, `medium`, `high`, `critical` | Incident priority level |
| `alert_status` | `open`, `acknowledged`, `resolved` | Alert response lifecycle |
| `notification_channel` | `in_app`, `email`, `slack` | Outbox transport medium |
| `notification_status` | `pending`, `sent`, `failed` | Delivery outbox state |

---

## 5. Security & Row Level Security (RLS) Conventions

1. **Mandatory RLS:** Row Level Security must be enabled (`alter table ... enable row level security;`) and forced (`force row level security;`) on all 17 tables.
2. **Tenant Boundary Filter:** Every RLS policy on tenant-owned tables must filter rows using:
   ```sql
   company_id = (select private.current_company_id())
   ```
3. **Helper Function Safety:**
   - All helper functions in `private` schema must specify `security definer` and `set search_path = ''` to prevent search path hijacking.
   - PostgREST execution permissions on `private` must remain revoked.
4. **Append-Only Protections:**
   - `audit_logs` must enforce mutation blocking: any `UPDATE` or `DELETE` attempt raises exception `23514` (Check Violation).
   - Each audit log row must compute `curr_hash = sha256(prev_hash || row_data)`.
5. **No Hard Deletes:**
   - Tables representing business entities (`companies`, `profiles`, `resources`) must never be hard-deleted. Use status deactivation.
