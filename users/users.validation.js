const ALLOWED_CREATE_FIELDS = [
  "full_name",
  "email",
  "employee_code",
  "department_id",
  "manager_id",
  "job_title",
];

const ALLOWED_UPDATE_FIELDS = [
  "full_name",
  "employee_code",
  "department_id",
  "manager_id",
  "job_title",
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const validateProfileCreate = (data) => {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Request body must be a valid object"];
  }

  if (typeof data.full_name !== "string" || !data.full_name.trim()) {
    errors.push("Full name is required");
  }

  if (typeof data.email !== "string" || !data.email.trim()) {
    errors.push("Email is required");
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email format");
  }

  if (
    data.employee_code !== undefined &&
    (typeof data.employee_code !== "string" ||
      !data.employee_code.trim())
  ) {
    errors.push("Employee code must be a non-empty string");
  }

  ["department_id", "manager_id"].forEach((field) => {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      !UUID_REGEX.test(data[field])
    ) {
      errors.push(`${field} must be a valid UUID`);
    }
  });

  if (
    data.job_title !== undefined &&
    data.job_title !== null &&
    typeof data.job_title !== "string"
  ) {
    errors.push("Job title must be a string");
  }

  const unexpected = Object.keys(data).filter(
    (field) => !ALLOWED_CREATE_FIELDS.includes(field)
  );

  if (unexpected.length) {
    errors.push(`Unexpected fields: ${unexpected.join(", ")}`);
  }

  return errors;
};

const validateProfileUpdate = (data) => {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Request body must be a valid object"];
  }

  if (Object.keys(data).length === 0) {
    errors.push("At least one field is required for update");
  }

  const unexpected = Object.keys(data).filter(
    (field) => !ALLOWED_UPDATE_FIELDS.includes(field)
  );

  if (unexpected.length) {
    errors.push(`Unexpected fields: ${unexpected.join(", ")}`);
  }

  if (
    data.full_name !== undefined &&
    (typeof data.full_name !== "string" || !data.full_name.trim())
  ) {
    errors.push("Full name must be a non-empty string");
  }

  if (
    data.employee_code !== undefined &&
    (typeof data.employee_code !== "string" ||
      !data.employee_code.trim())
  ) {
    errors.push("Employee code must be a non-empty string");
  }

  ["department_id", "manager_id"].forEach((field) => {
    if (
      data[field] !== undefined &&
      data[field] !== null &&
      !UUID_REGEX.test(data[field])
    ) {
      errors.push(`${field} must be a valid UUID`);
    }
  });

  if (
    data.job_title !== undefined &&
    data.job_title !== null &&
    typeof data.job_title !== "string"
  ) {
    errors.push("Job title must be a string");
  }

  return errors;
};

module.exports = {
  validateProfileCreate,
  validateProfileUpdate,
};