
const ALLOWED_EFFECTS = [
  "ALLOW",
  "BLOCK",
  "REQUIRES_APPROVAL",
];

const ALLOWED_CREATE_FIELDS = [
  "name",
  "description",
  "effect",
  "resource_id",
  "category_id",
  "applies_to_role",
  "applies_to_department_id",
  "require_authorized_network",
  "require_compliant_device",
  "max_grant_minutes",
  "priority",
  "extra_conditions",
];

const ALLOWED_UPDATE_FIELDS = [...ALLOWED_CREATE_FIELDS];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

// Checks whether the request body is a plain JSON object.
function isPlainObject(value) {
  if (value === null || typeof value !== "object") {
    return false;
  }

  if (Array.isArray(value)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(value);

  return (
    prototype === Object.prototype ||
    prototype === null
  );
}

// Checks UUID format.
function isValidUUID(value) {
  return (
    typeof value === "string" &&
    UUID_REGEX.test(value)
  );
}

// Validates string fields.
function validateString(
  value,
  fieldName,
  errors,
  options = {}
) {
  const {
    required = false,
    maxLength = 255,
    nullable = false,
  } = options;

  if (value === undefined) {
    if (required) {
      errors.push(`${fieldName} is required.`);
    }
    return;
  }

  if (value === null && nullable) {
    return;
  }

  if (typeof value !== "string") {
    errors.push(`${fieldName} must be a string.`);
    return;
  }

  const trimmedValue = value.trim();

  if (trimmedValue.length === 0) {
    errors.push(`${fieldName} cannot be empty.`);
    return;
  }

  if (trimmedValue.length > maxLength) {
    errors.push(
      `${fieldName} must not exceed ${maxLength} characters.`
    );
  }
}

// Validates UUID fields.
function validateUUID(value, fieldName, errors) {
  if (value === undefined || value === null) {
    return;
  }

  if (!isValidUUID(value)) {
    errors.push(
      `${fieldName} must be a valid UUID or null.`
    );
  }
}

// Validates policy effect.
function validateEffect(value, errors) {
  if (value === undefined) {
    return;
  }

  if (!ALLOWED_EFFECTS.includes(value)) {
    errors.push(
      `effect must be one of: ${ALLOWED_EFFECTS.join(", ")}.`
    );
  }
}

// Validates boolean fields.
function validateBoolean(value, fieldName, errors) {
  if (
    value !== undefined &&
    typeof value !== "boolean"
  ) {
    errors.push(`${fieldName} must be a boolean.`);
  }
}

// Validates integer fields.
function validateInteger(
  value,
  fieldName,
  errors,
  options = {}
) {
  const {
    allowZero = false,
    nullable = false,
  } = options;

  if (value === undefined) {
    return;
  }

  if (value === null && nullable) {
    return;
  }

  const isValid =
    Number.isSafeInteger(value) &&
    (allowZero ? value >= 0 : value > 0);

  if (!isValid) {
    errors.push(
      `${fieldName} must be a ${
        allowZero ? "non-negative" : "positive"
      } integer${nullable ? " or null" : ""}.`
    );
  }
}

// Rejects fields that clients are not allowed to submit.
function validateAllowedFields(
  body,
  allowedFields,
  errors
) {
  const unknownFields = Object.keys(body).filter(
    (field) => !allowedFields.includes(field)
  );

  if (unknownFields.length > 0) {
    errors.push(
      `Unsupported field(s): ${unknownFields.join(", ")}.`
    );
  }
}

// Validates resource, category and department references.
function validatePolicyReferences(body, errors) {
  validateUUID(body.resource_id, "resource_id", errors);

  validateUUID(body.category_id, "category_id", errors);

  validateUUID(
    body.applies_to_department_id,
    "applies_to_department_id",
    errors
  );

  if (body.resource_id && body.category_id) {
    errors.push(
      "A policy cannot target both a resource and a category."
    );
  }
}

// Validates common policy fields.
function validateCommonFields(
  body,
  errors,
  isUpdate = false
) {
  validateString(body.name, "name", errors, {
    required: !isUpdate,
    maxLength: 255,
  });

  validateString(body.description, "description", errors, {
    maxLength: 1000,
    nullable: true,
  });

  validateEffect(body.effect, errors);

  validateString(
    body.applies_to_role,
    "applies_to_role",
    errors,
    {
      maxLength: 100,
      nullable: true,
    }
  );

  validateBoolean(
    body.require_authorized_network,
    "require_authorized_network",
    errors
  );

  validateBoolean(
    body.require_compliant_device,
    "require_compliant_device",
    errors
  );

  validateInteger(
    body.max_grant_minutes,
    "max_grant_minutes",
    errors,
    {
      nullable: true,
    }
  );

  validateInteger(
    body.priority,
    "priority",
    errors,
    {
      allowZero: true,
    }
  );

  if (
    body.extra_conditions !== undefined &&
    !isPlainObject(body.extra_conditions)
  ) {
    errors.push(
      "extra_conditions must be a JSON object."
    );
  }

  validatePolicyReferences(body, errors);
}

// Middleware for creating policies.
function validateCreatePolicy(req, res, next) {
  const body = req.body;

  if (!isPlainObject(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a valid JSON object.",
    });
  }

  const errors = [];

  validateAllowedFields(
    body,
    ALLOWED_CREATE_FIELDS,
    errors
  );

  validateCommonFields(body, errors);

  if (body.effect === undefined) {
    errors.push("effect is required.");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Policy validation failed.",
      errors,
    });
  }

  return next();
}

// Middleware for partially updating policies.
function validateUpdatePolicy(req, res, next) {
  const body = req.body;

  if (!isPlainObject(body)) {
    return res.status(400).json({
      success: false,
      message: "Request body must be a valid JSON object.",
    });
  }

  const errors = [];

  validateAllowedFields(
    body,
    ALLOWED_UPDATE_FIELDS,
    errors
  );

  if (Object.keys(body).length === 0) {
    errors.push(
      "At least one field must be provided for update."
    );
  }

  validateCommonFields(body, errors, true);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Policy validation failed.",
      errors,
    });
  }

  return next();
}

// Middleware for pagination.
function validatePagination(req, res, next) {
  const pageValue = req.query.page ?? "1";
  const limitValue = req.query.limit ?? "20";

  const page = Number(pageValue);
  const limit = Number(limitValue);

  if (
    !/^\d+$/.test(String(pageValue)) ||
    !/^\d+$/.test(String(limitValue)) ||
    !Number.isSafeInteger(page) ||
    !Number.isSafeInteger(limit) ||
    page < 1 ||
    limit < 1 ||
    limit > 100
  ) {
    return res.status(400).json({
      success: false,
      message: "Invalid pagination parameters.",
      errors: [
        "page must be at least 1 and limit must be between 1 and 100.",
      ],
    });
  }

  req.pagination = {
    page,
    limit,
  };

  return next();
}

module.exports = {
  validateCreatePolicy,
  validateUpdatePolicy,
  validatePagination,
};
