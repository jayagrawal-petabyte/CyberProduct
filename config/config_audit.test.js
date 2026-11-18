/**
 * Comprehensive Config, Logger, and Error Security Audit Test Suite
 * CyberProduct Backend Architecture - Pallavi
 *
 * Verifies all security requirements specified in Audit Phase 6:
 * - Config: valid config, missing production variables, invalid URL, invalid numeric
 *   values (such as '3000abc'), test defaults, anon/service-role key separation.
 * - Logger: recursive redaction, bearer tokens, JWTs, error messages containing secrets,
 *   stack traces in production vs development.
 * - Error Handling: formatErrorResponse, operational errors, unexpected internal errors
 *   shielding internals, secret sanitization in messages and errors arrays.
 */

const { loadConfig } = require("./env");
const logger = require("./logger");
const {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  formatErrorResponse
} = require("./errors");

describe("Audit: Environment Configuration Security", () => {
  test("strictly rejects malformed numeric configuration like '3000abc'", () => {
    expect(() => {
      loadConfig({
        NODE_ENV: "test",
        PORT: "3000abc",
        SUPABASE_URL: "https://example.supabase.co"
      });
    }).toThrow(/PORT must be a valid integer/i);
  });

  test("rejects non-numeric ports and out-of-range ports", () => {
    expect(() => {
      loadConfig({ NODE_ENV: "test", PORT: "0" });
    }).toThrow(/PORT must be a valid TCP port number/i);

    expect(() => {
      loadConfig({ NODE_ENV: "test", PORT: "70000" });
    }).toThrow(/PORT must be a valid TCP port number/i);

    expect(() => {
      loadConfig({ NODE_ENV: "test", PORT: "port3000" });
    }).toThrow(/PORT must be a valid integer/i);
  });

  test("rejects invalid Supabase URL format", () => {
    expect(() => {
      loadConfig({
        NODE_ENV: "test",
        SUPABASE_URL: "ftp://invalid-protocol.supabase.co"
      });
    }).toThrow(/SUPABASE_URL must be a valid HTTP or HTTPS URL/i);
  });

  test("rejects unencrypted HTTP Supabase URL in production", () => {
    expect(() => {
      loadConfig({
        NODE_ENV: "production",
        SUPABASE_URL: "http://insecure.supabase.co",
        SUPABASE_ANON_KEY: "anon-key",
        SUPABASE_SERVICE_ROLE_KEY: "service-key"
      });
    }).toThrow(/HTTPS in production/i);
  });

  test("rejects identical anon key and service role key (privilege separation)", () => {
    expect(() => {
      loadConfig({
        NODE_ENV: "test",
        SUPABASE_URL: "https://example.supabase.co",
        SUPABASE_ANON_KEY: "identical-key-12345",
        SUPABASE_SERVICE_ROLE_KEY: "identical-key-12345"
      });
    }).toThrow(/SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY must not be identical/i);
  });

  test("fails on missing required production variables", () => {
    expect(() => {
      loadConfig({
        NODE_ENV: "production"
      });
    }).toThrow(/Environment configuration error/);
  });

  test("supplies safe defaults in test environment when not provided", () => {
    const config = loadConfig({ NODE_ENV: "test" });
    expect(config.server.isTest).toBe(true);
    expect(config.server.port).toBe(3000);
    expect(config.supabase.url).toBe("http://localhost:54321");
    expect(config.supabase.anonKey).toBe("mock-anon-key");
    expect(config.supabase.serviceRoleKey).toBe("mock-service-role-key");
  });
});

describe("Audit: Logger Redaction & Error Handling", () => {
  test("redacts embedded Bearer tokens and JWTs in free-form strings", () => {
    const rawLog = "Failed request: Authorization Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.signature";
    const sanitized = logger.sanitize(rawLog);

    expect(sanitized).not.toContain("Bearer eyJhbGciOi");
    expect(sanitized).toContain("[REDACTED_BEARER_TOKEN]");
  });

  test("redacts secrets embedded inside Error messages and custom error properties", () => {
    const err = new Error("Database connection to https://xyz.supabase.co failed with token secret-jwt-1234567890.abcdefghijklmnop.qrstuvwxyz");
    err.apiKey = "secret-api-key";

    const sanitized = logger.sanitize(err);
    expect(sanitized.apiKey).toBe("[REDACTED]");
    expect(sanitized.message).toContain("[REDACTED_JWT]");
  });

  test("redacts error stack traces in production mode", () => {
    const origEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = "production";

    try {
      const err = new Error("Production error");
      const sanitized = logger.sanitize(err);
      expect(sanitized.stack).toBeUndefined();
    } finally {
      process.env.NODE_ENV = origEnv;
    }
  });

  test("formatErrorResponse shields internal details for unexpected internal (500) errors", () => {
    const internalDbError = new Error("FATAL: database connection string with password=my_db_secret leaked");
    const { statusCode, body } = formatErrorResponse(internalDbError);

    expect(statusCode).toBe(500);
    expect(body.success).toBe(false);
    expect(body.message).toBe("An unexpected internal error occurred");
    expect(body.message).not.toContain("password");
  });

  test("formatErrorResponse returns expected messages for operational client errors (4xx)", () => {
    const validationErr = new ValidationError("Validation failed", ["Name is required"]);
    const { statusCode, body } = formatErrorResponse(validationErr);

    expect(statusCode).toBe(400);
    expect(body.success).toBe(false);
    expect(body.message).toBe("Validation failed");
    expect(body.errors).toEqual(["Name is required"]);
    expect(body.code).toBe("VALIDATION_ERROR");
  });

  test("formatErrorResponse redacts Bearer tokens and JWTs in error messages", () => {
    const err = new AuthenticationError("Invalid header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.signature");
    const { body } = formatErrorResponse(err);

    expect(body.message).not.toContain("Bearer eyJ");
    expect(body.message).toContain("[REDACTED_BEARER_TOKEN]");
  });
});
