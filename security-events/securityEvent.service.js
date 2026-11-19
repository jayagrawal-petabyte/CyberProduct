
const net = require("node:net");

const {
  AppError,
  ValidationError,
} = require("../config/errors");

const logger = require("../config/logger");
const { isValidRole } = require("../auth/rbac");

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const MAX_METADATA_BYTES = 8 * 1024;
const MAX_METADATA_DEPTH = 5;
const MAX_METADATA_ARRAY_ITEMS = 50;
const MAX_METADATA_STRING_LENGTH = 1000;

const SENSITIVE_METADATA_KEYS = new Set([
  "password",
  "passwd",
  "token",
  "accesstoken",
  "refreshtoken",
  "jwt",
  "secret",
  "authorization",
  "cookie",
  "apikey",
  "clientsecret",
  "servicerolekey",
  "email",
  "phonenumber",
  "mobile",
  "address",
  "fullname",
  "firstname",
  "lastname",
  "dateofbirth",
  "dob",
  "ssn",
  "rawurl",
  "fullurl",
]);

function isPlainObject(value) {
  if (
    value === null ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

function isValidUuidOrNull(value) {
  return (
    value === null ||
    value === undefined ||
    (
      typeof value === "string" &&
      UUID_REGEX.test(value)
    )
  );
}

function sanitizeString(value) {
  return value
    .replace(
      /bearer\s+[a-zA-Z0-9_.-]+/gi,
      "[REDACTED]"
    )
    .replace(
      /\b[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\b/g,
      "[REDACTED]"
    )
    .replace(
      /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi,
      "[REDACTED_EMAIL]"
    )
    .slice(0, MAX_METADATA_STRING_LENGTH);
}

function sanitizeMetadataValue(value, depth = 0) {
  if (depth > MAX_METADATA_DEPTH) {
    throw new ValidationError(
      "Security event metadata is nested too deeply."
    );
  }

  if (
    value === null ||
    typeof value === "boolean" ||
    typeof value === "number"
  ) {
    if (
      typeof value === "number" &&
      !Number.isFinite(value)
    ) {
      throw new ValidationError(
        "Security event metadata contains an invalid number."
      );
    }

    return value;
  }

  if (typeof value === "string") {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    if (value.length > MAX_METADATA_ARRAY_ITEMS) {
      throw new ValidationError(
        "Security event metadata contains too many array items."
      );
    }

    return value.map((item) =>
      sanitizeMetadataValue(item, depth + 1)
    );
  }

  if (!isPlainObject(value)) {
    throw new ValidationError(
      "Security event metadata must contain plain JSON values only."
    );
  }

  const cleanObject = {};

  for (const [key, nestedValue] of Object.entries(value)) {
    const normalizedKey = key
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");

    if (SENSITIVE_METADATA_KEYS.has(normalizedKey)) {
      continue;
    }

    cleanObject[key] = sanitizeMetadataValue(
      nestedValue,
      depth + 1
    );
  }

  return cleanObject;
}

function sanitizeMetadata(metadata = {}) {
  if (!isPlainObject(metadata)) {
    throw new ValidationError(
      "metadata must be a JSON object."
    );
  }

  const cleanMetadata =
    sanitizeMetadataValue(metadata);

  const serialized = JSON.stringify(cleanMetadata);

  if (
    Buffer.byteLength(serialized, "utf8") >
    MAX_METADATA_BYTES
  ) {
    throw new ValidationError(
      `metadata must not exceed ${MAX_METADATA_BYTES} bytes after sanitization.`
    );
  }

  return cleanMetadata;
}

function validateSecurityEvent(event) {
  const errors = [];

  if (!event || !isPlainObject(event)) {
    throw new ValidationError(
      "Security event must be an object."
    );
  }

  if (
    !isValidUuidOrNull(event.companyId) ||
    !event.companyId
  ) {
    errors.push("companyId must be a valid UUID.");
  }

  if (
    typeof event.eventType !== "string" ||
    !/^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)+$/.test(
      event.eventType
    ) ||
    event.eventType.length > 100
  ) {
    errors.push(
      "eventType must be a dotted event name, such as access.decision."
    );
  }

  if (!isValidUuidOrNull(event.actorId)) {
    errors.push(
      "actorId must be a valid UUID or null."
    );
  }

  if (
    event.actorRole !== undefined &&
    event.actorRole !== null &&
    !isValidRole(event.actorRole)
  ) {
    errors.push(
      "actorRole must be employee, lead, security_admin, or null."
    );
  }

  if (
    event.actorId == null &&
    event.actorRole != null
  ) {
    errors.push(
      "actorRole must be null for a system event without an actorId."
    );
  }

  if (
    event.targetType !== undefined &&
    event.targetType !== null &&
    (
      typeof event.targetType !== "string" ||
      !/^[a-z][a-z0-9_]*$/.test(event.targetType) ||
      event.targetType.length > 50
    )
  ) {
    errors.push(
      "targetType must be a valid lowercase identifier or null."
    );
  }

  if (!isValidUuidOrNull(event.targetId)) {
    errors.push(
      "targetId must be a valid UUID or null."
    );
  }

  if (
    typeof event.outcome !== "string" ||
    event.outcome.trim().length === 0 ||
    event.outcome.trim().length > 50
  ) {
    errors.push(
      "outcome is required and must be a string of at most 50 characters."
    );
  }

  if (
    event.reasonCode !== undefined &&
    event.reasonCode !== null &&
    (
      typeof event.reasonCode !== "string" ||
      event.reasonCode.trim().length === 0 ||
      event.reasonCode.length > 100
    )
  ) {
    errors.push(
      "reasonCode must be a non-empty string of at most 100 characters or null."
    );
  }

  if (
    event.ipAddress !== undefined &&
    event.ipAddress !== null &&
    (
      typeof event.ipAddress !== "string" ||
      net.isIP(event.ipAddress) === 0
    )
  ) {
    errors.push(
      "ipAddress must be a valid IPv4 or IPv6 address or null."
    );
  }

  if (errors.length > 0) {
    throw new ValidationError(
      "Security event validation failed.",
      errors
    );
  }
}

/**
 * Creates the shared append-only security-event writer.
 *
 * Use the service-role Supabase client because the database
 * permits audit-log inserts through service_role only.
 *
 * The database trigger generates id, created_at,
 * prev_hash and entry_hash.
 */
function createSecurityEventService({ supabase }) {
  if (
    !supabase ||
    typeof supabase.from !== "function"
  ) {
    throw new Error(
      "A service-role Supabase client is required."
    );
  }

  async function recordEvent(event) {
    validateSecurityEvent(event);

    const metadata = sanitizeMetadata(
      event.metadata || {}
    );

    const auditRow = {
      company_id: event.companyId,
      event_type: event.eventType.trim(),
      actor_id: event.actorId || null,
      actor_role: event.actorRole || null,
      target_type: event.targetType || null,
      target_id: event.targetId || null,
      outcome: event.outcome.trim(),
      reason_code: event.reasonCode
        ? event.reasonCode.trim()
        : null,
      ip_address: event.ipAddress || null,
      metadata,
    };

    const { data, error } = await supabase
      .from("audit_logs")
      .insert(auditRow)
      .select(
        "id, company_id, event_type, outcome, created_at, entry_hash"
      )
      .single();

    if (error) {
      logger.error(
        "Failed to write security audit event.",
        {
          code: error.code,
          message: error.message,
          eventType: auditRow.event_type,
          companyId: auditRow.company_id,
        }
      );

      throw new AppError(
        "Unable to record the security event.",
        500,
        {
          code: "AUDIT_WRITE_FAILED",
          isOperational: false,
        }
      );
    }

    return data;
  }

  return Object.freeze({ recordEvent });
}

module.exports = {
  createSecurityEventService,
  sanitizeMetadata,
  validateSecurityEvent,
};
