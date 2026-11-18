/**
 * Environment & Logger Security Tests
 * CyberProduct Backend Architecture - Pallavi
 */

const { loadConfig } = require("../config/env");
const logger = require("../config/logger");

describe("Environment Configuration & Security", () => {
  test("loads configuration with defaults in test environment", () => {
    const config = loadConfig({
      NODE_ENV: "test",
      PORT: "4000",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "anon-test-key",
      SUPABASE_SERVICE_ROLE_KEY: "service-test-key"
    });

    expect(config.server.port).toBe(4000);
    expect(config.server.isTest).toBe(true);
    expect(config.supabase.url).toBe("https://example.supabase.co");
    expect(config.supabase.anonKey).toBe("anon-test-key");
    expect(config.supabase.serviceRoleKey).toBe("service-test-key");
  });

  test("validates required variables in production/development mode", () => {
    expect(() => {
      loadConfig({
        NODE_ENV: "production",
        SUPABASE_URL: "not-a-url"
      });
    }).toThrow(/Environment configuration error/);
  });

  test("sanitizes configuration to prevent secret leakage", () => {
    const config = loadConfig({
      NODE_ENV: "test",
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_ANON_KEY: "secret-anon-key",
      SUPABASE_SERVICE_ROLE_KEY: "super-secret-service-role-key"
    });

    const sanitized = config.getSanitized();

    expect(sanitized.supabase.url).toBe("https://example.supabase.co");
    expect(sanitized.supabase.anonKeyConfigured).toBe(true);
    expect(sanitized.supabase.serviceRoleKeyConfigured).toBe(true);
    // Raw secrets must not be present in sanitized output
    expect(sanitized.supabase.anonKey).toBeUndefined();
    expect(sanitized.supabase.serviceRoleKey).toBeUndefined();
  });

  test("logger redacts sensitive fields recursively", () => {
    const payload = {
      username: "alice",
      password: "SuperSecretPassword123!",
      token: "secret-token-xyz",
      accessToken: "access-token-123",
      nested: {
        authorization: "Bearer secret-jwt-abc",
        apiKey: "pk_live_12345"
      }
    };

    const sanitized = logger.sanitize(payload);

    expect(sanitized.username).toBe("alice");
    expect(sanitized.password).toBe("[REDACTED]");
    expect(sanitized.token).toBe("[REDACTED]");
    expect(sanitized.accessToken).toBe("[REDACTED]");
    expect(sanitized.nested.authorization).toBe("[REDACTED]");
    expect(sanitized.nested.apiKey).toBe("[REDACTED]");
  });

  test("logger redacts Bearer tokens in plain string values", () => {
    const text = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.e30.signature";
    const sanitized = logger.sanitize(text);
    expect(sanitized).toBe("[REDACTED_BEARER_TOKEN]");
  });
});
