/**
 * Company Configuration & Tenant Management Tests
 * CyberProduct Backend Architecture - Pallavi
 *
 * Covers Phase Seven requirements:
 *  - Successful company creation
 *  - Duplicate slug conflict (409)
 *  - Missing company name validation (400)
 *  - Invalid slug format validation (400)
 *  - Invalid settings JSON (400)
 *  - Secrets in settings rejected (400)
 *  - Invalid status validation (400)
 *  - Unauthorized company creation (403)
 *  - Unauthorized company update (403)
 *  - Attempted hard deletion rejection (405)
 *  - Attempted tenant identity modification
 *  - Cross-tenant update prevention
 */

const express = require("express");
const request = require("supertest");

// Mock supabase before importing routes and service
jest.mock("../config/supabase", () => ({
  createUserSupabaseClient: jest.fn(),
  createServiceSupabaseClient: jest.fn()
}));

const { createServiceSupabaseClient } = require("../config/supabase");
const companyRoutes = require("../config/company.routes");
const {
  validateCompanyCreation,
  validateSettingsObject
} = require("../config/company.validation");

describe("Company Validation Unit Tests", () => {
  test("validates valid company payload successfully", () => {
    const payload = {
      name: "Acme Cyber Security",
      slug: "acme-cyber-sec",
      settings: {
        stale_after_minutes: 60,
        default_grant_minutes: 120,
        log_full_urls: true
      }
    };

    const errors = validateCompanyCreation(payload);
    expect(errors).toHaveLength(0);
  });

  test("rejects missing or empty company name", () => {
    expect(validateCompanyCreation({ slug: "acme" })).toContain("Company name is required");
    expect(validateCompanyCreation({ name: "   ", slug: "acme" })).toContain("Company name is required");
    expect(validateCompanyCreation({ name: "A", slug: "acme" })).toContain(
      "Company name must be between 2 and 100 characters"
    );
  });

  test("rejects invalid slugs (uppercase, spaces, special chars)", () => {
    expect(validateCompanyCreation({ name: "Acme", slug: "Acme Corp" })).toContain(
      "Company slug must contain only lowercase alphanumeric characters and single hyphens (e.g., 'acme-corp')"
    );
    expect(validateCompanyCreation({ name: "Acme", slug: "acme_corp" })).toContain(
      "Company slug must contain only lowercase alphanumeric characters and single hyphens (e.g., 'acme-corp')"
    );
    expect(validateCompanyCreation({ name: "Acme", slug: "-acme-" })).toContain(
      "Company slug must contain only lowercase alphanumeric characters and single hyphens (e.g., 'acme-corp')"
    );
  });

  test("rejects invalid status", () => {
    const errors = validateCompanyCreation({
      name: "Acme",
      slug: "acme",
      status: "deleted"
    });
    expect(errors).toContain("Status must be either 'active' or 'inactive'");
  });

  test("strictly rejects secrets stored inside settings JSON", () => {
    const settingsWithSecret = {
      stale_after_minutes: 30,
      apiKey: "secret-key-12345"
    };

    const errors = validateSettingsObject(settingsWithSecret);
    expect(errors).toContain("Secret 'apiKey' must never be stored in company settings");
  });

  test("strictly rejects unsupported or unknown settings keys", () => {
    const settings = {
      unknown_field: "foo"
    };

    const errors = validateSettingsObject(settings);
    expect(errors).toContain("Unrecognized or unsupported setting: 'unknown_field'");
  });

  test("validates setting data types (e.g. log_full_urls must be boolean)", () => {
    const settings = {
      log_full_urls: "yes"
    };

    const errors = validateSettingsObject(settings);
    expect(errors).toContain("log_full_urls must be a boolean (true or false)");
  });
});

describe("Company API Endpoints Integration Tests", () => {
  let app;
  let mockSupabase;

  const TEST_COMPANY_ID = "11111111-1111-1111-1111-111111111111";
  const OTHER_COMPANY_ID = "22222222-2222-2222-2222-222222222222";

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      from: jest.fn()
    };
    createServiceSupabaseClient.mockReturnValue(mockSupabase);

    app = express();
    app.use(express.json());

    // Inject mock user context middleware
    app.use((req, res, next) => {
      const role = req.headers["x-test-role"] || "security_admin";
      const companyId = req.headers["x-test-company"] || TEST_COMPANY_ID;
      const userId = req.headers["x-test-user"] || "user-admin";

      if (req.headers["x-test-unauthenticated"] !== "true") {
        req.user = {
          id: userId,
          role,
          company_id: companyId,
          status: "active"
        };
        req.accessToken = "mock-token";
      }
      next();
    });

    app.use("/api/v1/companies", companyRoutes);
  });

  test("successful company creation with valid data", async () => {
    const newCompany = {
      id: "33333333-3333-3333-3333-333333333333",
      name: "New Enterprise",
      slug: "new-enterprise",
      status: "active",
      settings: { log_full_urls: false },
      policy_version: 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: newCompany, error: null })
    });

    const res = await request(app)
      .post("/api/v1/companies")
      .set("x-test-role", "security_admin")
      .send({
        name: "New Enterprise",
        slug: "new-enterprise"
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe("New Enterprise");
    expect(res.body.data.policy_version).toBe(1);
  });

  test("duplicate slug returns 409 Conflict", async () => {
    mockSupabase.from.mockReturnValue({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: { code: "23505", message: "duplicate key value violates unique constraint" }
      })
    });

    const res = await request(app)
      .post("/api/v1/companies")
      .set("x-test-role", "security_admin")
      .send({
        name: "Duplicate Enterprise",
        slug: "duplicate-enterprise"
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/already exists/i);
  });

  test("ordinary employee is blocked from creating a company (403)", async () => {
    const res = await request(app)
      .post("/api/v1/companies")
      .set("x-test-role", "employee")
      .send({
        name: "Unauthorized Company",
        slug: "unauthorized-company"
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("GET /me returns current authenticated user's company details", async () => {
    const existingCompany = {
      id: TEST_COMPANY_ID,
      name: "Current Tenant Corp",
      slug: "current-tenant",
      status: "active",
      settings: { stale_after_minutes: 60 },
      policy_version: 3
    };

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: existingCompany, error: null })
    });

    const res = await request(app)
      .get("/api/v1/companies/me")
      .set("x-test-role", "employee");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(TEST_COMPANY_ID);
  });

  test("blocks cross-tenant company retrieval by non-admin or mismatched tenant", async () => {
    const res = await request(app)
      .get(`/api/v1/companies/${OTHER_COMPANY_ID}`)
      .set("x-test-company", TEST_COMPANY_ID);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/cross-tenant/i);
  });

  test("security admin can update company settings", async () => {
    const existingCompany = {
      id: TEST_COMPANY_ID,
      name: "Acme",
      slug: "acme",
      settings: { log_full_urls: false }
    };

    const updatedCompany = {
      ...existingCompany,
      settings: { log_full_urls: true, stale_after_minutes: 45 }
    };

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: existingCompany, error: null }),
      update: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updatedCompany, error: null })
    }));

    const res = await request(app)
      .patch(`/api/v1/companies/${TEST_COMPANY_ID}/settings`)
      .set("x-test-role", "security_admin")
      .set("x-test-company", TEST_COMPANY_ID)
      .send({
        settings: {
          log_full_urls: true,
          stale_after_minutes: 45
        }
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.settings.stale_after_minutes).toBe(45);
  });

  test("rejects attempt to modify core identity fields (id, slug) via settings endpoint", async () => {
    const res = await request(app)
      .patch(`/api/v1/companies/${TEST_COMPANY_ID}/settings`)
      .set("x-test-role", "security_admin")
      .set("x-test-company", TEST_COMPANY_ID)
      .send({
        slug: "new-tampered-slug",
        id: OTHER_COMPANY_ID
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/cannot be modified/i);
  });

  test("ordinary employee is blocked from updating company settings (403)", async () => {
    const res = await request(app)
      .patch(`/api/v1/companies/${TEST_COMPANY_ID}/settings`)
      .set("x-test-role", "employee")
      .send({
        settings: { log_full_urls: true }
      });

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  test("security admin can update status to 'inactive'", async () => {
    const updatedCompany = {
      id: TEST_COMPANY_ID,
      name: "Acme",
      slug: "acme",
      status: "inactive"
    };

    mockSupabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: updatedCompany, error: null }),
      update: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: updatedCompany, error: null })
    }));

    const res = await request(app)
      .patch(`/api/v1/companies/${TEST_COMPANY_ID}/status`)
      .set("x-test-role", "security_admin")
      .set("x-test-company", TEST_COMPANY_ID)
      .send({ status: "inactive" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe("inactive");
  });

  test("DELETE request is strictly rejected with 405 Method Not Allowed (no hard deletes)", async () => {
    const res = await request(app).delete(`/api/v1/companies/${TEST_COMPANY_ID}`);

    expect(res.status).toBe(405);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/cannot be hard deleted/i);
  });
});
