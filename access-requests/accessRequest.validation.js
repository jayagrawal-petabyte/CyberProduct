
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function validateCreateAccessRequest(req, res, next) {
  const {
    resource_id,
    device_id = null,
    reason,
    requested_duration_minutes = null
  } = req.body || {};

  const errors = [];

  if (typeof resource_id !== "string" || !UUID_REGEX.test(resource_id)) {
    errors.push("A valid resource_id is required");
  }

  if (
    device_id !== null &&
    (typeof device_id !== "string" || !UUID_REGEX.test(device_id))
  ) {
    errors.push("device_id must be a valid UUID or null");
  }

  if (
    typeof reason !== "string" ||
    reason.trim().length === 0 ||
    reason.trim().length > 1000
  ) {
    errors.push("Reason must contain between 1 and 1000 characters");
  }

  if (
    requested_duration_minutes !== null &&
    (!Number.isInteger(requested_duration_minutes) ||
      requested_duration_minutes <= 0)
  ) {
    errors.push("Requested duration must be a positive integer or null");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  req.validatedBody = {
    resource_id,
    device_id,
    reason: reason.trim(),
    requested_duration_minutes
  };

  next();
}

module.exports = { validateCreateAccessRequest };
