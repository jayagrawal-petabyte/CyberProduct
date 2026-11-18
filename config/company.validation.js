/**
 * Company Configuration Validation
 * CyberProduct Backend Architecture - Pallavi
 *
 * Implements strict validation for company creation, slug handles,
 * settings JSON schema, and record status.
 * Prevents storage of secrets in company settings and ensures data integrity.
 */

const { ValidationError } = require("./errors");

const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const ALLOWED_STATUSES = new Set(["active", "inactive"]);

// Known company settings keys and their validators
const SETTINGS_SPEC = {
  stale_after_minutes: (val) => Number.isInteger(val) && val > 0,
  default_grant_minutes: (val) => Number.isInteger(val) && val > 0,
  log_full_urls: (val) => typeof val === "boolean"
};

// Forbidden setting keys that must never be stored in settings JSONB
const FORBIDDEN_SECRET_KEYS = new Set([
  "password",
  "secret",
  "token",
  "access_token",
  "jwt",
  "api_key",
  "apikey",
  "service_role_key",
  "servicerolekey",
  "anon_key",
  "private_key",
  "credential",
  "credentials",
  "webhook_url",
  "slack_webhook"
]);

/**
 * Validates company creation payload.
 *
 * @param {Object} data
 * @returns {Array<string>} List of validation error messages
 */
function validateCompanyCreation(data) {
  const errors = [];

  if (!data || typeof data !== "object") {
    return ["Request body is required and must be an object"];
  }

  // Name validation
  if (typeof data.name !== "string" || data.name.trim().length === 0) {
    errors.push("Company name is required");
  } else if (data.name.trim().length < 2 || data.name.trim().length > 100) {
    errors.push("Company name must be between 2 and 100 characters");
  }

  // Slug validation
  if (typeof data.slug !== "string" || data.slug.trim().length === 0) {
    errors.push("Company slug is required");
  } else {
    const trimmedSlug = data.slug.trim().toLowerCase();
    if (trimmedSlug.length < 2 || trimmedSlug.length > 60) {
      errors.push("Company slug must be between 2 and 60 characters");
    } else if (!SLUG_REGEX.test(trimmedSlug)) {
      errors.push("Company slug must contain only lowercase alphanumeric characters and single hyphens (e.g., 'acme-corp')");
    }
  }

  // Status validation (optional on creation, defaults to 'active')
  if (data.status !== undefined) {
    if (!ALLOWED_STATUSES.has(data.status)) {
      errors.push("Status must be either 'active' or 'inactive'");
    }
  }

  // Settings validation
  if (data.settings !== undefined) {
    const settingsErrors = validateSettingsObject(data.settings);
    errors.push(...settingsErrors);
  }

  return errors;
}

/**
 * Validates the company settings JSONB object.
 *
 * @param {*} settings
 * @returns {Array<string>} Validation error messages
 */
function validateSettingsObject(settings) {
  const errors = [];

  if (settings === null || typeof settings !== "object" || Array.isArray(settings)) {
    return ["Settings must be a valid JSON object"];
  }

  for (const [key, val] of Object.entries(settings)) {
    const lowerKey = key.toLowerCase();

    // Check for secrets
    if (FORBIDDEN_SECRET_KEYS.has(lowerKey)) {
      errors.push(`Secret '${key}' must never be stored in company settings`);
      continue;
    }

    // Validate known settings
    if (key === "stale_after_minutes") {
      if (!Number.isInteger(val) || val <= 0) {
        errors.push("stale_after_minutes must be a positive integer");
      }
    } else if (key === "default_grant_minutes") {
      if (!Number.isInteger(val) || val <= 0) {
        errors.push("default_grant_minutes must be a positive integer");
      }
    } else if (key === "log_full_urls") {
      if (typeof val !== "boolean") {
        errors.push("log_full_urls must be a boolean (true or false)");
      }
    } else {
      // Reject non-whitelisted keys to prevent schema contamination
      errors.push(`Unrecognized or unsupported setting: '${key}'`);
    }
  }

  return errors;
}

/**
 * Validates status update.
 *
 * @param {string} status
 * @returns {Array<string>}
 */
function validateStatus(status) {
  if (!status || typeof status !== "string" || !ALLOWED_STATUSES.has(status)) {
    return ["Status must be either 'active' or 'inactive'"];
  }
  return [];
}

/**
 * Express middleware for validating company creation requests.
 */
function validateCreateCompanyMiddleware(req, res, next) {
  const errors = validateCompanyCreation(req.body);
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  req.validatedBody = {
    name: req.body.name.trim(),
    slug: req.body.slug.trim().toLowerCase(),
    status: req.body.status || "active",
    settings: req.body.settings || {}
  };

  next();
}

/**
 * Express middleware for validating settings update requests.
 */
function validateUpdateSettingsMiddleware(req, res, next) {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      success: false,
      message: "Request body must contain settings to update"
    });
  }

  // Prevent modifying company core identity attributes via settings endpoint
  const immutableFields = ["id", "name", "slug", "status", "policy_version", "created_at", "updated_at"];
  for (const field of immutableFields) {
    if (req.body[field] !== undefined) {
      return res.status(400).json({
        success: false,
        message: `Field '${field}' cannot be modified via settings endpoint`
      });
    }
  }

  const settingsToValidate = req.body.settings !== undefined ? req.body.settings : req.body;
  const errors = validateSettingsObject(settingsToValidate);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  req.validatedSettings = settingsToValidate;
  next();
}

/**
 * Express middleware for validating company status change requests.
 */
function validateUpdateStatusMiddleware(req, res, next) {
  const status = req.body?.status;
  const errors = validateStatus(status);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  req.validatedStatus = status;
  next();
}

module.exports = {
  SLUG_REGEX,
  UUID_REGEX,
  ALLOWED_STATUSES,
  validateCompanyCreation,
  validateSettingsObject,
  validateStatus,
  validateCreateCompanyMiddleware,
  validateUpdateSettingsMiddleware,
  validateUpdateStatusMiddleware
};
