
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CREATE_FIELDS = [
  "name",
  "resource_type",
  "identifier",
  "category_id",
  "description",
  "sensitivity",
];

const UPDATE_FIELDS = [
  "name",
  "identifier",
  "category_id",
  "description",
  "sensitivity",
  "status",
];

const FILTER_FIELDS = [
  "page",
  "limit",
  "search",
  "category_id",
  "resource_type",
  "sensitivity",
  "status",
];

function validateObject(body) {
  return (
    body !== null &&
    typeof body === "object" &&
    !Array.isArray(body)
  );
}

function validateAllowedFields(body, allowedFields) {
  const errors = [];

  for (const field of Object.keys(body)) {
    if (!allowedFields.includes(field)) {
      errors.push(`Field '${field}' is not allowed.`);
    }
  }

  return errors;
}

function validateRequiredString(body, field, errors, maxLength) {
  const value = body[field];

  if (typeof value !== "string" || !value.trim()) {
    errors.push(
      `${field} is required and must be a non-empty string.`
    );
    return;
  }

  if (value.trim().length > maxLength) {
    errors.push(
      `${field} must not exceed ${maxLength} characters.`
    );
  }
}

function validateOptionalString(
  body,
  field,
  errors,
  maxLength,
  allowNull = false
) {
  const value = body[field];

  if (value === undefined) return;

  if (allowNull && value === null) return;

  if (typeof value !== "string") {
    errors.push(
      `${field} must be a string${allowNull ? " or null" : ""}.`
    );
    return;
  }

  if (!value.trim()) {
    errors.push(`${field} must not be empty.`);
    return;
  }

  if (value.length > maxLength) {
    errors.push(
      `${field} must not exceed ${maxLength} characters.`
    );
  }
}

function validateCategoryId(body, errors) {
  const value = body.category_id;

  if (value === undefined || value === null) return;

  if (typeof value !== "string" || !UUID_REGEX.test(value)) {
    errors.push("Category ID must be a valid UUID or null.");
  }
}

function validateCreateResource(body) {
  if (!validateObject(body)) {
    return ["Request body must be an object."];
  }

  const errors = validateAllowedFields(body, CREATE_FIELDS);

  validateRequiredString(body, "name", errors, 150);
  validateRequiredString(body, "resource_type", errors, 50);
  validateRequiredString(body, "identifier", errors, 255);

  validateCategoryId(body, errors);

  validateOptionalString(
    body,
    "description",
    errors,
    1000,
    true
  );

  validateOptionalString(
    body,
    "sensitivity",
    errors,
    50
  );

  return errors;
}

function validateUpdateResource(body) {
  if (!validateObject(body)) {
    return ["Request body must be an object."];
  }

  const errors = validateAllowedFields(body, UPDATE_FIELDS);
  const fields = Object.keys(body);

  if (fields.length === 0) {
    errors.push("At least one field must be provided.");
  }

  if (body.name !== undefined) {
    validateRequiredString(body, "name", errors, 150);
  }

  if (body.identifier !== undefined) {
    validateRequiredString(body, "identifier", errors, 255);
  }

  validateCategoryId(body, errors);

  validateOptionalString(
    body,
    "description",
    errors,
    1000,
    true
  );

  validateOptionalString(
    body,
    "sensitivity",
    errors,
    50
  );

  validateOptionalString(
    body,
    "status",
    errors,
    50
  );

  return errors;
}

function validatePagination(query) {
  const page = Number(query.page ?? 1);
  const limit = Number(query.limit ?? 20);

  if (!Number.isSafeInteger(page) || page < 1) {
    return {
      error: "Page must be a positive integer.",
    };
  }

  if (!Number.isSafeInteger(limit) || limit < 1 || limit > 100) {
    return {
      error: "Limit must be between 1 and 100.",
    };
  }

  return {
    page,
    limit,
  };
}

function validateResourceFilters(query) {
  if (!validateObject(query)) {
    return {
      errors: ["Query parameters must be an object."],
      pagination: null,
    };
  }

  const errors = validateAllowedFields(query, FILTER_FIELDS);
  const pagination = validatePagination(query);

  if (pagination.error) {
    errors.push(pagination.error);
  }

  if (query.search !== undefined) {
    validateOptionalString(query, "search", errors, 200);
  }

  if (query.category_id !== undefined) {
    if (
      typeof query.category_id !== "string" ||
      !UUID_REGEX.test(query.category_id)
    ) {
      errors.push("Category ID must be a valid UUID.");
    }
  }

  for (const field of [
    "resource_type",
    "sensitivity",
    "status",
  ]) {
    if (query[field] !== undefined) {
      validateOptionalString(query, field, errors, 50);
    }
  }

  return {
    errors,
    pagination: pagination.error
      ? null
      : {
          page: pagination.page,
          limit: pagination.limit,
        },
  };
}

module.exports = {
  validateCreateResource,
  validateUpdateResource,
  validatePagination,
  validateResourceFilters,
};
