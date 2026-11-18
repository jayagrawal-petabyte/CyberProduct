/**
 * Secure Environment Configuration
 * CyberProduct Backend Architecture - Pallavi
 *
 * Validates, loads, and encapsulates environment variables for the backend.
 * Ensures required secrets and endpoints are present and properly formatted.
 * Never exposes service-role credentials to untrusted callers.
 */

require("dotenv").config();

/**
 * Validates environment variables and constructs configuration object.
 *
 * @param {NodeJS.ProcessEnv} [env=process.env]
 * @returns {Object} Validated and frozen configuration object
 */
function loadConfig(env = process.env) {
  const errors = [];

  const supabaseUrl = env.SUPABASE_URL;
  const supabaseAnonKey = env.SUPABASE_ANON_KEY;
  const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
  const supabaseJwtSecret = env.SUPABASE_JWT_SECRET;
  const nodeEnv = env.NODE_ENV || "development";
  const isTest = nodeEnv === "test";
  const isProduction = nodeEnv === "production";

  // Strict port validation: reject malformed values like '3000abc'
  const rawPort = env.PORT !== undefined && env.PORT !== null && String(env.PORT).trim() !== ""
    ? String(env.PORT).trim()
    : "3000";

  let parsedPort;
  if (!/^\d+$/.test(rawPort)) {
    errors.push("PORT must be a valid integer number (1-65535)");
  } else {
    parsedPort = Number(rawPort);
    if (!Number.isInteger(parsedPort) || parsedPort < 1 || parsedPort > 65535) {
      errors.push("PORT must be a valid TCP port number (1-65535)");
    }
  }

  // Supabase URL validation
  if (!supabaseUrl) {
    if (!isTest) {
      errors.push("SUPABASE_URL environment variable is required");
    }
  } else {
    try {
      const parsedUrl = new URL(supabaseUrl);
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        errors.push("SUPABASE_URL must be a valid HTTP or HTTPS URL");
      } else if (isProduction && parsedUrl.protocol !== "https:") {
        errors.push("SUPABASE_URL must use HTTPS in production");
      }
    } catch {
      errors.push("SUPABASE_URL must be a valid HTTP or HTTPS URL");
    }
  }

  // Supabase Anon Key validation
  if (!supabaseAnonKey && !isTest) {
    errors.push("SUPABASE_ANON_KEY environment variable is required");
  }

  // Supabase Service Role Key validation
  if (!supabaseServiceRoleKey && !isTest) {
    errors.push("SUPABASE_SERVICE_ROLE_KEY environment variable is required");
  }

  // Ensure key separation: Anon key must never equal service-role key
  if (supabaseAnonKey && supabaseServiceRoleKey && supabaseAnonKey === supabaseServiceRoleKey) {
    errors.push("SUPABASE_ANON_KEY and SUPABASE_SERVICE_ROLE_KEY must not be identical");
  }

  if (errors.length > 0) {
    throw new Error(`Environment configuration error:\n - ${errors.join("\n - ")}`);
  }

  const config = {
    supabase: {
      url: supabaseUrl || "http://localhost:54321",
      anonKey: supabaseAnonKey || "mock-anon-key",
      serviceRoleKey: supabaseServiceRoleKey || "mock-service-role-key",
      jwtSecret: supabaseJwtSecret || null
    },
    server: {
      port: parsedPort !== undefined ? parsedPort : 3000,
      nodeEnv,
      isProduction: nodeEnv === "production",
      isTest: nodeEnv === "test"
    },

    /**
     * Returns a copy of the configuration with all secrets and keys redacted.
     * Safe to log or expose in administrative diagnostics.
     */
    getSanitized() {
      return {
        supabase: {
          url: this.supabase.url,
          anonKeyConfigured: Boolean(this.supabase.anonKey),
          serviceRoleKeyConfigured: Boolean(this.supabase.serviceRoleKey),
          jwtSecretConfigured: Boolean(this.supabase.jwtSecret)
        },
        server: {
          port: this.server.port,
          nodeEnv: this.server.nodeEnv
        }
      };
    }
  };

  return Object.freeze(config);
}

const config = loadConfig();

module.exports = {
  config,
  loadConfig
};
