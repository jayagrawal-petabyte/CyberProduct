# CyberProduct — Backend Architecture & Module Boundaries (L1-01)
**Author:** Pallavi — Backend Architecture & Security  
**Status:** Approved Architecture Specification  
**Scope:** Architecture foundations, request lifecycle, authentication/authorization contracts, and module boundaries.

---

## 1. System Overview & Technology Stack

CyberProduct is a multi-tenant cybersecurity access control and monitoring platform. Its core responsibilities include:
- Verifying device posture and corporate network connectivity.
- Enforcing resource-level website and application access restrictions.
- Managing temporary access request/approval workflows with time-based automatic grant revocation.
- Providing append-only cryptographic audit logging and incident response alerting.

### Core Stack
- **Runtime:** Node.js (>=20 LTS)
- **Framework:** Express 5.x
- **Database & Identity:** Supabase (PostgreSQL 15+, Supabase Auth)
- **Security:** Helmet, CORS, Row Level Security (RLS), HMAC-SHA256 JWT signature verification, PBKDF2/cryptographic hashing

---

## 2. Team Workstreams & Module Boundaries

The backend is developed by six contributors with strict module and table ownership:

| Workstream | Owner | Directory | Tables Owned | Responsibilities |
|---|---|---|---|---|
| **Backend Architecture & Security** | **Pallavi** | `auth/`, `config/` | `companies` | Foundational architecture, JWT verification, RBAC, tenant configuration & isolation, secure logging, shared error standards |
| **Access Control Engine & Integration** | **Soumya Pathak** | `access-engine/`, `integrations/`, `database/` (joint) | `corporate_networks`, `device_network_checks`, `access_decisions`, `access_sessions` | Access decision engine (ALLOW, BLOCK, REQUIRES_APPROVAL), network checks, grant expiry enforcement, cross-module integration |
| **Identity & Device Management** | **Vasu Moradiya** | `users/`, `devices/` | `departments`, `profiles`, `devices` | User profile retrieval & update, device registration, device compliance state, employee-device associations |
| **Resources & Policy Management** | **Aum Jalodara** | `resources/`, `policies/` | `resource_categories`, `resources`, `policies` | Restricted website/application registry, resource categories, policy definitions & priorities |
| **Access Requests & Approvals** | **Swetha M** | `access-requests/`, `approvals/` | `approval_delegations`, `access_requests`, `access_grants` | Request submission lifecycle, manager approvals/rejections, temporary duration-limited access grants, backup delegates |
| **Security Monitoring & Dashboard** | **Biplav Rout** | `security-events/`, `dashboard/` | `audit_logs`, `alerts`, `notifications` | Tamper-resistant append-only audit trail (hash-chained), security alert triage, notification dispatch outbox |

---

## 3. End-to-End API Request Lifecycle

All incoming HTTP requests to protected endpoints undergo a unified pipeline:

```
[ Client Request ]
       │
       ▼
[ Express Router ] ── (Helmet, CORS, JSON Body Parsing)
       │
       ▼
[ requireAuthenticatedUser ]  <auth/auth.middleware.js>
       │ 1. Extract Bearer token from Authorization header.
       │ 2. Pre-validate structure and exp timestamp.
       │ 3. Verify cryptographic signature via Supabase Auth / local secret.
       │ 4. Query public.profiles: confirm active user profile.
       │ 5. Query public.companies: confirm active tenant.
       │ 6. Attach req.user, req.company, and req.accessToken.
       │
       ▼
[ RBAC Authorization Middleware ]  <auth/rbac.js>
       │ - requireRole('security_admin' | 'lead' | 'employee')
       │ - requireSameCompany(companyIdResolver)
       │ - requireOwnRecordOrAdmin(ownerIdResolver)
       │
       ▼
[ Request Validation Middleware ]  <module.validation.js>
       │ - Validates payload against schema using standard regex & bounds.
       │ - Populates req.validatedBody / req.validatedSettings.
       │
       ▼
[ Controller ]  <module.controller.js>
       │ - Orchestrates service calls.
       │ - Extracts tenant context exclusively from req.user.company_id.
       │
       ▼
[ Service Layer ]  <module.service.js>
       │ - Executes business rules.
       │ - Selects client:
       │    * createUserSupabaseClient(req.accessToken) for user-scoped RLS operations.
       │    * createServiceSupabaseClient() for privileged/system operations.
       │
       ▼
[ Supabase PostgreSQL ]
       │ - Row Level Security (RLS) enforcement.
       │ - Triggers: set_updated_at, guards, audit hash chaining.
       │
       ▼
[ Standardized Response ]  <config/errors.js>
       │ - Success: { success: true, message: "...", data: ... }
       │ - Failure: { success: false, message: "...", errors?: [...] }
```

---

## 4. Authentication & Authorization Contracts

### 4.1 Authenticated Request Context (`req.user` and `req.company`)
Once authenticated, every request contains:

```javascript
req.user = {
  id: "uuid",                 // Matches auth.users.id & profiles.id
  email: "user@example.com",
  full_name: "User Name",
  role: "employee" | "lead" | "security_admin",
  company_id: "uuid",         // Verified tenant ID
  department_id: "uuid" | null,
  manager_id: "uuid" | null,
  job_title: "Title" | null,
  status: "active"
};

req.company = {
  id: "uuid",
  name: "Company Name",
  slug: "company-slug",
  status: "active",
  settings: {
    stale_after_minutes: 60,
    default_grant_minutes: 120,
    log_full_urls: false
  },
  policy_version: 1
};

req.accessToken = "raw.jwt.token";
```

### 4.2 Security Administrator Rules
- Role assignment and status changes (`active`, `suspended`, `deactivated`) on `profiles` can only be performed by `security_admin`.
- `security_admin` cannot modify their own role or status (self-lockout / self-escalation guard).
- Company settings update and company deactivation can only be performed by `security_admin`.
- Company creation is a trusted operation using service role.

---

## 5. Module Integration Guide for Collaborators

### For Vasu (`users/`, `devices/`)
- Attach `requireAuthenticatedUser` to protected routes.
- Access `req.accessToken` when invoking `createUserSupabaseClient(req.accessToken)` to ensure database RLS applies.
- Do not trust `company_id` or `owner_id` from the request body; rely on database trigger `set_company_from_session()`.

### For Aum (`policies/`, `resources/`)
- Inject `authenticate` and `requireSecurityAdmin` from `../auth/auth.middleware`:
  ```javascript
  const { authenticate, requireSecurityAdmin } = require("../auth/auth.middleware");
  const routes = createPolicyRoutes({ policyController, authenticate, requireSecurityAdmin });
  ```

### For Swetha (`access-requests/`, `approvals/`)
- Use `requireAuthenticatedUser` on request submission routes.
- For approvals: Leads can approve requests for their direct reports (`manager_id = req.user.id`) or where delegated via `approval_delegations`.
- Security administrators can review and approve any requests within their company.

### For Biplav (`security-events/`, `dashboard/`)
- Audit logs are append-only. Never create routes or methods that permit `UPDATE` or `DELETE` on `audit_logs`.
- Ensure all sensitive data (passwords, JWTs, credentials) are stripped before logging using `logger.sanitize()`.
