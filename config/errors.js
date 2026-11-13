/**
 * Standard Error Classes and Formatting
 * CyberProduct Backend Architecture - Pallavi
 *
 * Defines consistent error types and response structures across the backend.
 * All errors follow predictable HTTP status codes and prevent internal
 * stack trace leakage to API clients.
 */

class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code
   * @param {Object} [options]
   * @param {Array<string>} [options.errors] - Field-level validation error messages
   * @param {string} [options.code] - Machine-readable error code
   * @param {boolean} [options.isOperational] - Whether the error is an expected operational error
   */
  constructor(message, statusCode = 500, options = {}) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.isOperational = options.isOperational !== undefined ? options.isOperational : true;
    this.code = options.code;
    if (options.errors && Array.isArray(options.errors)) {
      this.errors = options.errors;
    }
    Error.captureStackTrace(this, this.constructor);
  }
}

class ValidationError extends AppError {
  /**
   * @param {string} message
   * @param {Array<string>} [errors]
   */
  constructor(message = "Validation failed", errors = []) {
    super(message, 400, { errors, code: "VALIDATION_ERROR" });
  }
}

class AuthenticationError extends AppError {
  /**
   * @param {string} message
   * @param {string} [code]
   */
  constructor(message = "Authentication required", code = "AUTHENTICATION_ERROR") {
    super(message, 401, { code });
  }
}

class ForbiddenError extends AppError {
  /**
   * @param {string} message
   * @param {string} [code]
   */
  constructor(message = "Access denied: insufficient permissions", code = "FORBIDDEN") {
    super(message, 403, { code });
  }
}

class NotFoundError extends AppError {
  /**
   * @param {string} message
   * @param {string} [code]
   */
  constructor(message = "Resource not found", code = "NOT_FOUND") {
    super(message, 404, { code });
  }
}

class ConflictError extends AppError {
  /**
   * @param {string} message
   * @param {string} [code]
   */
  constructor(message = "Conflict with existing resource", code = "CONFLICT") {
    super(message, 409, { code });
  }
}

class MethodNotAllowedError extends AppError {
  /**
   * @param {string} message
   * @param {string} [code]
   */
  constructor(message = "Method not allowed", code = "METHOD_NOT_ALLOWED") {
    super(message, 405, { code });
  }
}

/**
 * Formats an error into a standardized API response envelope.
 * Guarantees that internal stack traces and server internals are never exposed.
 *
 * @param {Error|AppError} err
 * @returns {{ statusCode: number, body: { success: boolean, message: string, errors?: Array<string>, code?: string } }}
 */
function formatErrorResponse(err) {
  const statusCode = err.statusCode || (err.name === "ValidationError" ? 400 : 500);

  // Only expose custom error message if it's an operational client error (4xx) or explicitly marked operational
  const isOperational = err.isOperational === true || (statusCode >= 400 && statusCode < 500);

  const rawMessage = isOperational && err.message
    ? String(err.message)
    : "An unexpected internal error occurred";

  // Sanitize message to prevent secret, token, or credential leakage
  const sanitizedMessage = rawMessage
    .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, "[REDACTED_BEARER_TOKEN]")
    .replace(/\b[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g, "[REDACTED_JWT]");

  const body = {
    success: false,
    message: sanitizedMessage
  };

  if (err.errors && Array.isArray(err.errors) && err.errors.length > 0) {
    body.errors = err.errors.map((msg) =>
      typeof msg === "string"
        ? msg
            .replace(/bearer\s+[a-zA-Z0-9_\-\.]+/gi, "[REDACTED_BEARER_TOKEN]")
            .replace(/\b[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\.[A-Za-z0-9_-]{15,}\b/g, "[REDACTED_JWT]")
        : String(msg)
    );
  }

  if (err.code) {
    body.code = err.code;
  }

  return { statusCode, body };
}

module.exports = {
  AppError,
  ValidationError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
  MethodNotAllowedError,
  formatErrorResponse
};
