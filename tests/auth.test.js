/**
 * Authentication Middleware & JWT Verification Tests
 * CyberProduct Backend Architecture - Pallavi
 *
 * Covers Phase Seven requirements:
 *  - Valid JWT
 *  - Missing JWT
 *  - Malformed JWT
 *  - Invalid signature
 *  - Expired JWT
 *  - Missing profile
 *  - Inactive company
 *  - Suspended user
 *  - Deactivated user
 */

const crypto = require("crypto");
const express = require("express");
const request = require("supertest");

// Mock supabase client creator before loading auth middleware
jest.mock("../config/supabase", () => {
  return {
    createUserSupabaseClient: jest.fn(),
    createServiceSupabaseClient: jest.fn()
  };
});

const { createServiceSupabaseClient } = require("../config/supabase");
const {
  requireAuthenticatedUser,
  authenticate
} = require("../auth/auth.middleware");
const {
  extractBearerToken,
  decodeJwt,
  validateExpiration,
  verifyHmacSignature,
  verifySupabaseToken
} = require("../auth/jwt");

const { config } = require("../config/env");

const ACTIVE_SECRET = config.supabase.jwtSecret || "test-jwt-secret-at-least-32-chars-long";

// Helper to create valid JWT strings for testing
function createTestJwt({
  sub = "00000000-0000-0000-0000-000000000001",
  email = "test@company.com",
  exp = Math.floor(Date.now() / 1000) + 3600,
  secret = ACTIVE_SECRET
} = {}) {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { sub, email, exp, role: "authenticated" };

  const headerB64 = Buffer.from(JSON.stringify(header)).toString("base64url");
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const data = `${headerB64}.${payloadB64}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  return `${headerB64}.${payloadB64}.${signature}`;
}

describe("JWT Utility Functions", () => {
  const TEST_SECRET = "test-jwt-secret-at-least-32-chars-long";

  test("extractBearerToken correctly extracts token from header", () => {
    const req = { headers: { authorization: "Bearer my-secret-jwt" } };
    expect(extractBearerToken(req)).toBe("my-secret-jwt");
  });

  test("extractBearerToken throws on missing header", () => {
    const req = { headers: {} };
    expect(() => extractBearerToken(req)).toThrow(/Authentication token is required/);
  });

  test("extractBearerToken throws on malformed header", () => {
    const req = { headers: { authorization: "Basic abc:123" } };
    expect(() => extractBearerToken(req)).toThrow(/must follow 'Bearer <token>' format/);
  });

  test("decodeJwt correctly decodes header and payload", () => {
    const token = createTestJwt({ email: "user@test.com" });
    const { header, payload, signature } = decodeJwt(token);

    expect(header.alg).toBe("HS256");
    expect(payload.email).toBe("user@test.com");
    expect(typeof signature).toBe("string");
  });

  test("decodeJwt throws on malformed token structure", () => {
    expect(() => decodeJwt("invalid.token")).toThrow(/malformed/);
  });

  test("validateExpiration throws when token exp is in the past", () => {
    const expiredPayload = { exp: Math.floor(Date.now() / 1000) - 10 };
    expect(() => validateExpiration(expiredPayload)).toThrow(/expired/);
  });

  test("verifyHmacSignature validates correct signature", () => {
    const token = createTestJwt({ secret: TEST_SECRET });
    expect(verifyHmacSignature(token, TEST_SECRET)).toBe(true);
    expect(verifyHmacSignature(token, "wrong-secret")).toBe(false);
  });
});

describe("requireAuthenticatedUser Middleware", () => {
  let app;
  let mockSupabase;

  beforeEach(() => {
    jest.clearAllMocks();

    mockSupabase = {
      auth: {
        getUser: jest.fn()
      },
      from: jest.fn()
    };

    createServiceSupabaseClient.mockReturnValue(mockSupabase);

    app = express();
    app.use(express.json());

    app.get("/test-protected", requireAuthenticatedUser, (req, res) => {
      res.status(200).json({
        success: true,
        user: req.user,
        company: req.company
      });
    });
  });

  test("rejects request when Authorization header is missing", async () => {
    const res = await request(app).get("/test-protected");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/Authentication token is required/i);
  });

  test("rejects request when token is malformed", async () => {
    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", "Bearer not-a-valid-jwt");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/malformed/i);
  });

  test("rejects request when token has expired", async () => {
    const expiredToken = createTestJwt({
      exp: Math.floor(Date.now() / 1000) - 100
    });

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/expired/i);
  });

  test("rejects request when token has an invalid signature", async () => {
    const invalidToken = createTestJwt({ secret: "wrong-secret-12345678901234567890" });

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", `Bearer ${invalidToken}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/signature|invalid/i);
  });

  test("verifySupabaseToken rejects when Supabase Auth API returns error", async () => {
    const token = createTestJwt();
    const mockClient = {
      auth: {
        getUser: jest.fn().mockResolvedValue({
          data: { user: null },
          error: { message: "Token is invalid" }
        })
      }
    };

    await expect(verifySupabaseToken(token, mockClient, null)).rejects.toThrow(/invalid/i);
  });

  test("rejects request when user has no database profile", async () => {
    const token = createTestJwt({ sub: "user-without-profile" });

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "user-without-profile", email: "noprofile@test.com" } },
      error: null
    });

    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn().mockResolvedValue({ data: null, error: null })
    });

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/profile not found/i);
  });

  test("rejects request when user profile is suspended", async () => {
    const token = createTestJwt({ sub: "suspended-user" });

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "suspended-user", email: "suspended@test.com" } },
      error: null
    });

    mockSupabase.from.mockImplementation((table) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: "suspended-user",
              company_id: "company-123",
              role: "employee",
              status: "suspended",
              full_name: "Suspended Employee",
              email: "suspended@test.com"
            },
            error: null
          })
        };
      }
      return { select: jest.fn().mockReturnThis() };
    });

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/suspended/i);
  });

  test("rejects request when user profile is deactivated", async () => {
    const token = createTestJwt({ sub: "deactivated-user" });

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "deactivated-user", email: "deactivated@test.com" } },
      error: null
    });

    mockSupabase.from.mockImplementation((table) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: "deactivated-user",
              company_id: "company-123",
              role: "employee",
              status: "deactivated",
              full_name: "Deactivated Employee",
              email: "deactivated@test.com"
            },
            error: null
          })
        };
      }
      return { select: jest.fn().mockReturnThis() };
    });

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/deactivated/i);
  });

  test("rejects request when company is inactive", async () => {
    const token = createTestJwt({ sub: "valid-user" });

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "valid-user", email: "valid@test.com" } },
      error: null
    });

    mockSupabase.from.mockImplementation((table) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: "valid-user",
              company_id: "inactive-company",
              role: "employee",
              status: "active",
              full_name: "Valid Employee",
              email: "valid@test.com"
            },
            error: null
          })
        };
      }
      if (table === "companies") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: "inactive-company",
              name: "Inactive Corp",
              slug: "inactive-corp",
              status: "inactive",
              policy_version: 1
            },
            error: null
          })
        };
      }
      return { select: jest.fn().mockReturnThis() };
    });

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toMatch(/company account is inactive/i);
  });

  test("authenticates valid user with active profile and company", async () => {
    const token = createTestJwt({ sub: "active-user" });

    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: "active-user", email: "active@test.com" } },
      error: null
    });

    mockSupabase.from.mockImplementation((table) => {
      if (table === "profiles") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: "active-user",
              company_id: "active-company",
              employee_code: "EMP-001",
              full_name: "Jane Doe",
              email: "active@test.com",
              role: "employee",
              department_id: "dept-1",
              manager_id: "lead-1",
              job_title: "Engineer",
              status: "active"
            },
            error: null
          })
        };
      }
      if (table === "companies") {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          maybeSingle: jest.fn().mockResolvedValue({
            data: {
              id: "active-company",
              name: "Active Corp",
              slug: "active-corp",
              status: "active",
              settings: { log_full_urls: false },
              policy_version: 2
            },
            error: null
          })
        };
      }
      return { select: jest.fn().mockReturnThis() };
    });

    const res = await request(app)
      .get("/test-protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.user.id).toBe("active-user");
    expect(res.body.user.role).toBe("employee");
    expect(res.body.company.id).toBe("active-company");
  });

  test("preserves backward compatibility when req.user and req.accessToken are pre-populated", async () => {
    const customApp = express();

    // Mock middleware setting req.user and req.accessToken before requireAuthenticatedUser runs
    customApp.use((req, res, next) => {
      req.user = {
        id: "pre-set-user-id",
        company_id: "pre-set-company-id",
        role: "lead"
      };
      req.accessToken = "pre-set-token";
      next();
    });

    customApp.get("/compat-test", requireAuthenticatedUser, (req, res) => {
      res.status(200).json({ success: true, userId: req.user.id });
    });

    const res = await request(customApp).get("/compat-test");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.userId).toBe("pre-set-user-id");
  });
});
