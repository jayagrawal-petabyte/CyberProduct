/**
 * Safe Logging Utility
 * CyberProduct Backend Architecture - Pallavi
 *
 * Implements safe structured logging with automatic redaction of sensitive
 * credentials, authentication tokens, API secrets, and personal information.
 * Enforces PRD Section 8 and Shared Definition of Done standards.
 */

const SENSITIVE_KEYS = new Set([
  "password",
  "token",
  "accesstoken",
  "access_token",
  "jwt",
  "secret",
  "service_role_key",
  "servicerolekey",
  "anon_key",
  "anonkey",
  "authorization",
  "bearer",
  "cookie",
  "apikey",
  "api_key",
  "refresh_token",
  "refreshtoken",
  "client_secret",
  "clientsecret"
]);

/**
 * Recursively deep-clones an object while redacting sensitive fields.
 *
 * @param {*} data - Data to sanitize
 * @param {number} [depth=0] - Recursion depth limit
 * @returns {*} Sanitized data
 */
function sanitizeData(data, depth = 0) {
  if (depth > 6 || data === null || data === undefined) {
    return data;
  }

  if (typeof data === "string") {
    // If the entire string is a bearer token, return exact match for backward compatibility
    if (/^bearer\s+[a-zA-Z0-9_\-\.]+/i.test(data.trim())) {
      return "[REDACTED_BEARER_TOKEN]";
    }
    // If the entire string is a JWT
    if (/^[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}$/.test(data.trim())) {
      return "[REDACTED_JWT]";
    }
    // Redact embedded bearer tokens, JWTs, and passwords in free-form strings
    let sanitizedString = data
      .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, "[REDACTED_BEARER_TOKEN]")
      .replace(/\b[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, "[REDACTED_JWT]");
    return sanitizedString;
  }

  if (typeof data !== "object") {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map((item) => sanitizeData(item, depth + 1));
  }

  if (data instanceof Error) {
    const sanitizedError = {
      name: data.name,
      message: sanitizeData(data.message),
      statusCode: data.statusCode,
      code: data.code,
      stack: process.env.NODE_ENV === "production" ? undefined : sanitizeData(data.stack)
    };

    // Redact any extra custom properties attached to the Error object
    for (const [key, value] of Object.entries(data)) {
      if (!["name", "message", "statusCode", "code", "stack"].includes(key)) {
        const normalizedKey = key.toLowerCase().replace(/[-_]/g, "");
        if (SENSITIVE_KEYS.has(normalizedKey) || SENSITIVE_KEYS.has(key.toLowerCase())) {
          sanitizedError[key] = "[REDACTED]";
        } else {
          sanitizedError[key] = sanitizeData(value, depth + 1);
        }
      }
    }

    return sanitizedError;
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(data)) {
    const normalizedKey = key.toLowerCase().replace(/[-_]/g, "");
    if (SENSITIVE_KEYS.has(normalizedKey) || SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = "[REDACTED]";
    } else {
      sanitized[key] = sanitizeData(value, depth + 1);
    }
  }

  return sanitized;
}

const logger = {
  /**
   * Log informational message
   * @param {string} message
   * @param {*} [meta]
   */
  info(message, meta) {
    if (process.env.NODE_ENV !== "test") {
      const sanitizedMeta = meta !== undefined ? sanitizeData(meta) : "";
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`, sanitizedMeta);
    }
  },

  /**
   * Log warning message
   * @param {string} message
   * @param {*} [meta]
   */
  warn(message, meta) {
    if (process.env.NODE_ENV !== "test") {
      const sanitizedMeta = meta !== undefined ? sanitizeData(meta) : "";
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`, sanitizedMeta);
    }
  },

  /**
   * Log error message safely
   * @param {string} message
   * @param {*} [error]
   */
  error(message, error) {
    if (process.env.NODE_ENV !== "test") {
      const sanitizedError = error !== undefined ? sanitizeData(error) : "";
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`, sanitizedError);
    }
  },

  /**
   * Log debug message
   * @param {string} message
   * @param {*} [meta]
   */
  debug(message, meta) {
    if (process.env.NODE_ENV === "development") {
      const sanitizedMeta = meta !== undefined ? sanitizeData(meta) : "";
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${message}`, sanitizedMeta);
    }
  },

  sanitize: sanitizeData
};

module.exports = logger;
