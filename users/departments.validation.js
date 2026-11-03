
const ALLOWED_FIELDS = ["name", "description"];

const validateDepartment = (data) => {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Request body must be a valid object"];
  }

  if (
    typeof data.name !== "string" ||
    data.name.trim().length === 0
  ) {
    errors.push("Department name is required");
  } else if (data.name.trim().length > 100) {
    errors.push("Department name cannot exceed 100 characters");
  }

  if (
    data.description !== undefined &&
    data.description !== null &&
    typeof data.description !== "string"
  ) {
    errors.push("Description must be a string or null");
  }

  const unexpectedFields = Object.keys(data).filter(
    (field) => !ALLOWED_FIELDS.includes(field)
  );

  if (unexpectedFields.length > 0) {
    errors.push(
      `Unexpected fields: ${unexpectedFields.join(", ")}`
    );
  }

  return errors;
};

const validateDepartmentUpdate = (data) => {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Request body must be a valid object"];
  }

  if (Object.keys(data).length === 0) {
    errors.push("At least one field is required for update");
  }

  const unexpectedFields = Object.keys(data).filter(
    (field) => !ALLOWED_FIELDS.includes(field)
  );

  if (unexpectedFields.length > 0) {
    errors.push(
      `Unexpected fields: ${unexpectedFields.join(", ")}`
    );
  }

  if (
    data.name !== undefined &&
    (typeof data.name !== "string" ||
      data.name.trim().length === 0 ||
      data.name.trim().length > 100)
  ) {
    errors.push("Name must be a non-empty string of at most 100 characters");
  }

  if (
    data.description !== undefined &&
    data.description !== null &&
    typeof data.description !== "string"
  ) {
    errors.push("Description must be a string or null");
  }

  return errors;
};

module.exports = {
  validateDepartment,
  validateDepartmentUpdate,
};
