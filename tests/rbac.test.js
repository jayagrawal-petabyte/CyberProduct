/**
 * RBAC & Tenant Isolation Middleware Tests
 * CyberProduct Backend Architecture - Pallavi
 *
 * Covers Phase Seven requirements:
 *  - Employee permissions
 *  - Lead permissions
 *  - Security administrator permissions
 *  - Unauthorized role access
 *  - Privilege escalation attempts
 *  - Object ownership checks
 *  - Cross-company access attempts
 */

const express = require("express");
const request = require("supertest");
const {
  ROLES,
  requireRole,
  requireSecurityAdmin,
  requireLead,
  requireLeadOrAdmin,
  requireEmployee,
  requireSameCompany,
  requireOwnRecordOrAdmin
} = require("../auth/rbac");

describe("Role-Based Access Control (RBAC) Middleware", () => {
  let app;

  beforeEach(() => {
    app = express();
    app.use(express.json());

    // Middleware to simulate authenticated user context
    app.use((req, res, next) => {
      const authHeader = req.headers["x-test-role"];
      const companyHeader = req.headers["x-test-company"] || "company-1";
      const userHeader = req.headers["x-test-user"] || "user-1";

      if (authHeader) {
        req.user = {
          id: userHeader,
          role: authHeader,
          company_id: companyHeader
        };
      }
      next();
    });

    // Endpoints protected by different role requirements
    app.get("/admin-only", requireSecurityAdmin, (req, res) => {
      res.status(200).json({ success: true, message: "Admin access granted" });
    });

    app.get("/lead-only", requireLead, (req, res) => {
      res.status(200).json({ success: true, message: "Lead access granted" });
    });

    app.get("/lead-or-admin", requireLeadOrAdmin, (req, res) => {
      res.status(200).json({ success: true, message: "Lead/Admin access granted" });
    });

    app.get("/employee-accessible", requireEmployee, (req, res) => {
      res.status(200).json({ success: true, message: "Employee access granted" });
    });

    app.get(
      "/tenant-scoped/:companyId",
      requireSameCompany((req) => req.params.companyId),
      (req, res) => {
        res.status(200).json({ success: true, message: "Tenant match verified" });
      }
    );

    app.get(
      "/own-record/:ownerId",
      requireOwnRecordOrAdmin((req) => req.params.ownerId),
      (req, res) => {
        res.status(200).json({ success: true, message: "Ownership verified" });
      }
    );
  });

  test("rejects access when user context is missing", async () => {
    const res = await request(app).get("/admin-only");
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  test("security administrator can access admin-only endpoints", async () => {
    const res = await request(app)
      .get("/admin-only")
      .set("x-test-role", ROLES.SECURITY_ADMIN);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("rejects employee from accessing admin-only endpoint (privilege escalation prevention)", async () => {
    const res = await request(app)
      .get("/admin-only")
      .set("x-test-role", ROLES.EMPLOYEE);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Forbidden/i);
  });

  test("rejects lead from accessing admin-only endpoint", async () => {
    const res = await request(app)
      .get("/admin-only")
      .set("x-test-role", ROLES.LEAD);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("lead can access lead-only endpoint", async () => {
    const res = await request(app)
      .get("/lead-only")
      .set("x-test-role", ROLES.LEAD);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("employee cannot access lead-only endpoint", async () => {
    const res = await request(app)
      .get("/lead-only")
      .set("x-test-role", ROLES.EMPLOYEE);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("both lead and security admin can access lead-or-admin endpoint", async () => {
    const leadRes = await request(app)
      .get("/lead-or-admin")
      .set("x-test-role", ROLES.LEAD);

    expect(leadRes.status).toBe(200);

    const adminRes = await request(app)
      .get("/lead-or-admin")
      .set("x-test-role", ROLES.SECURITY_ADMIN);

    expect(adminRes.status).toBe(200);

    const empRes = await request(app)
      .get("/lead-or-admin")
      .set("x-test-role", ROLES.EMPLOYEE);

    expect(empRes.status).toBe(403);
  });

  test("all roles can access employee-level endpoints", async () => {
    const empRes = await request(app)
      .get("/employee-accessible")
      .set("x-test-role", ROLES.EMPLOYEE);
    expect(empRes.status).toBe(200);

    const leadRes = await request(app)
      .get("/employee-accessible")
      .set("x-test-role", ROLES.LEAD);
    expect(leadRes.status).toBe(200);

    const adminRes = await request(app)
      .get("/employee-accessible")
      .set("x-test-role", ROLES.SECURITY_ADMIN);
    expect(adminRes.status).toBe(200);
  });

  test("requireSameCompany allows access within the same tenant", async () => {
    const res = await request(app)
      .get("/tenant-scoped/company-1")
      .set("x-test-role", ROLES.EMPLOYEE)
      .set("x-test-company", "company-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("requireSameCompany strictly blocks cross-tenant access attempts", async () => {
    const res = await request(app)
      .get("/tenant-scoped/company-2")
      .set("x-test-role", ROLES.EMPLOYEE)
      .set("x-test-company", "company-1");

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/cross-tenant/i);
  });

  test("requireOwnRecordOrAdmin allows employee to access their own record", async () => {
    const res = await request(app)
      .get("/own-record/user-1")
      .set("x-test-role", ROLES.EMPLOYEE)
      .set("x-test-user", "user-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("requireOwnRecordOrAdmin blocks employee from accessing another user's record", async () => {
    const res = await request(app)
      .get("/own-record/user-2")
      .set("x-test-role", ROLES.EMPLOYEE)
      .set("x-test-user", "user-1");

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/own records/i);
  });

  test("requireOwnRecordOrAdmin allows security admin to view records of other users in company", async () => {
    const res = await request(app)
      .get("/own-record/user-2")
      .set("x-test-role", ROLES.SECURITY_ADMIN)
      .set("x-test-user", "admin-1");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  test("throws error during setup if an unrecognized role is passed to requireRole", () => {
    expect(() => {
      requireRole("super_admin");
    }).toThrow(/Invalid role configured/);
  });
});
