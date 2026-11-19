
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const ALLOWED_FILTERS = [
  "alert_type",
  "severity",
  "status",
  "user_id",
  "device_id",
  "resource_id",
  "from",
  "to",
  "limit",
  "page",
];

function isValidDate(value) {
  if (typeof value !== "string") return false;

  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) &&
    /^\d{4}-\d{2}-\d{2}T/.test(value)
  );
}

function validateAlertFilters(req, res, next) {
  const query = req.query || {};
  const errors = [];

  for (const field of Object.keys(query)) {
    if (!ALLOWED_FILTERS.includes(field)) {
      errors.push(`Filter '${field}' is not supported.`);
    }
  }

  const limit = Number(query.limit ?? 20);
  const page = Number(query.page ?? 1);

  if (
    !Number.isSafeInteger(limit) ||
    limit < 1 ||
    limit > 100
  ) {
    errors.push("limit must be an integer between 1 and 100.");
  }

  if (
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 100000
  ) {
    errors.push("page must be a positive integer.");
  }

  for (const field of ["alert_type", "severity", "status"]) {
    if (
      query[field] !== undefined &&
      (
        typeof query[field] !== "string" ||
        !/^[a-zA-Z0-9_-]{1,50}$/.test(query[field])
      )
    ) {
      errors.push(`${field} must be a valid string.`);
    }
  }

  for (const field of ["user_id", "device_id", "resource_id"]) {
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

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid alert filters.",
      errors,
    });
  }

  req.validatedAlertFilters = {
    alert_type: query.alert_type,
    severity: query.severity,
    status: query.status,
    user_id: query.user_id,
    device_id: query.device_id,
    resource_id: query.resource_id,
    from: query.from,
    to: query.to,
    limit,
    page,
  };

  next();
}

module.exports = {
  validateAlertFilters,
};
