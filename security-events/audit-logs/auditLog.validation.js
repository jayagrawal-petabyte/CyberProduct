
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_FILTERS = [
  "event_type",
  "outcome",
  "actor_id",
  "target_type",
  "target_id",
  "from",
  "to",
  "limit",
  "cursor",
];

function isValidDate(value) {
  if (typeof value !== "string") return false;

  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) &&
    /^\d{4}-\d{2}-\d{2}T/.test(value)
  );
}

function decodeCursor(cursor) {
  try {
    const decoded = Buffer
      .from(cursor, "base64url")
      .toString("utf8");

    const parsed = JSON.parse(decoded);

    if (
      !parsed ||
      typeof parsed.created_at !== "string" ||
      !isValidDate(parsed.created_at) ||
      typeof parsed.id !== "string" ||
      !/^[1-9]\d*$/.test(parsed.id)
    ) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function validateAuditLogFilters(req, res, next) {
  const query = req.query || {};
  const errors = [];

  for (const field of Object.keys(query)) {
    if (!ALLOWED_FILTERS.includes(field)) {
      errors.push(`Filter '${field}' is not supported.`);
    }
  }

  const limit = Number(query.limit ?? 20);

  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    errors.push("limit must be an integer between 1 and 100.");
  }

  if (query.event_type !== undefined) {
    if (
      typeof query.event_type !== "string" ||
      !/^[a-z][a-z0-9]*(\.[a-z][a-z0-9_]*)+$/.test(
        query.event_type
      ) ||
      query.event_type.length > 100
    ) {
      errors.push("event_type must be a valid dotted event name.");
    }
  }

  if (query.outcome !== undefined) {
    if (
      typeof query.outcome !== "string" ||
      !/^[a-zA-Z0-9_-]{1,50}$/.test(query.outcome)
    ) {
      errors.push("outcome must be a valid string.");
    }
  }

  for (const field of ["actor_id", "target_id"]) {
    if (
      query[field] !== undefined &&
      (
        typeof query[field] !== "string" ||
        !UUID_REGEX.test(query[field])
      )
    ) {
      errors.push(`${field} must be a valid UUID.`);
    }
  }

  if (query.target_type !== undefined) {
    if (
      typeof query.target_type !== "string" ||
      !/^[a-z][a-z0-9_]{0,49}$/.test(query.target_type)
    ) {
      errors.push("target_type must be a valid identifier.");
    }
  }

  for (const field of ["from", "to"]) {
    if (
      query[field] !== undefined &&
      !isValidDate(query[field])
    ) {
      errors.push(`${field} must be a valid ISO date-time.`);
    }
  }

  if (
    query.from &&
    query.to &&
    new Date(query.from) > new Date(query.to)
  ) {
    errors.push("'from' cannot be later than 'to'.");
  }

  if (query.cursor !== undefined) {
    if (
      typeof query.cursor !== "string" ||
      query.cursor.length > 500 ||
      !decodeCursor(query.cursor)
    ) {
      errors.push("cursor is invalid.");
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid audit-log filters.",
      errors,
    });
  }

  req.validatedAuditFilters = {
    event_type: query.event_type,
    outcome: query.outcome,
    actor_id: query.actor_id,
    target_type: query.target_type,
    target_id: query.target_id,
    from: query.from,
    to: query.to,
    limit,
    cursor: query.cursor,
  };

  next();
}

module.exports = {
  validateAuditLogFilters,
  decodeCursor,
};
