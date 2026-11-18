
const ALLOWED_STATUSES = ["active", "inactive"];

function validateCreateCategory(body) {
  const errors = [];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be an object."];
  }

  const allowedFields = ["name", "description"];

  for (const field of Object.keys(body)) {
    if (!allowedFields.includes(field)) {
      errors.push(`Field '${field}' is not allowed.`);
    }
  }

  if (typeof body.name !== "string" || !body.name.trim()) {
    errors.push("Name is required.");
  } else if (body.name.trim().length > 100) {
    errors.push("Name must not exceed 100 characters.");
  }

  if (
    body.description !== undefined &&
    body.description !== null &&
    typeof body.description !== "string"
  ) {
    errors.push("Description must be a string or null.");
  } else if (
    typeof body.description === "string" &&
    body.description.length > 500
  ) {
    errors.push("Description must not exceed 500 characters.");
  }

  return errors;
}

function validateUpdateCategory(body) {
  const errors = [];
  const allowedFields = ["name", "description", "status"];

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return ["Request body must be an object."];
  }

  const fields = Object.keys(body);

  if (fields.length === 0) {
    errors.push("At least one field must be provided.");
  }

  for (const field of fields) {
    if (!allowedFields.includes(field)) {
      errors.push(`Field '${field}' is not allowed.`);
    }
  }

  if (body.name !== undefined) {
    if (typeof body.name !== "string" || !body.name.trim()) {
      errors.push("Name must be a non-empty string.");
    } else if (body.name.trim().length > 100) {
      errors.push("Name must not exceed 100 characters.");
    }
  }

  if (body.description !== undefined) {
    if (
      body.description !== null &&
      typeof body.description !== "string"
    ) {
      errors.push("Description must be a string or null.");
    } else if (
      typeof body.description === "string" &&
      body.description.length > 500
    ) {
      errors.push("Description must not exceed 500 characters.");
    }
  }

  if (
    body.status !== undefined &&
    !ALLOWED_STATUSES.includes(body.status)
  ) {
    errors.push("Status must be active or inactive.");
  }

  return errors;
}

function validatePagination(query) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);

  if (!Number.isSafeInteger(page) || page < 1) {
    return { error: "Page must be a positive integer." };
  }

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    return { error: "Limit must be between 1 and 100." };
  }

  return { page, limit };
}

module.exports = {
  validateCreateCategory,
  validateUpdateCategory,
  validatePagination,
};
