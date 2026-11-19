
const ALLOWED_QUERY_FIELDS = ["from", "to"];

function isValidDate(value) {
  if (typeof value !== "string") return false;

  const date = new Date(value);

  return (
    !Number.isNaN(date.getTime()) &&
    /^\d{4}-\d{2}-\d{2}T/.test(value)
  );
}

function validateDashboardQuery(req, res, next) {
  const query = req.query || {};
  const errors = [];

  for (const field of Object.keys(query)) {
    if (!ALLOWED_QUERY_FIELDS.includes(field)) {
      errors.push(`Query parameter '${field}' is not supported.`);
    }
  }

  for (const field of ALLOWED_QUERY_FIELDS) {
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
      message: "Invalid dashboard filters.",
      errors,
    });
  }

  req.validatedDashboardFilters = {
    from: query.from,
    to: query.to,
  };

  next();
}

module.exports = {
  validateDashboardQuery,
};
