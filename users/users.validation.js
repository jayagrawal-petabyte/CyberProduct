
const CREATE_FIELDS = [
  "full_name",
  "email",
  "employee_code",
  "department_id",
  "manager_id",
  "job_title",
];

const UPDATE_FIELDS = [
  "full_name",
  "employee_code",
  "department_id",
  "manager_id",
  "job_title",
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const validateProfileCreate = (data) => {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Request body must be a valid object"];
  }

  if (typeof data.full_name !== "string" || !data.full_name.trim()) {
    errors.push("Full name is required");
  } else if (data.full_name.trim().length > 150) {
    errors.push("Full name cannot exceed 150 characters");
  }

  if (
    typeof data.email !== "string" ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())
  ) {
    errors.push("A valid email address is required");
  }

  if (
    data.employee_code !== undefined &&
    data.employee_code !== null &&
    (typeof data.employee_code !== "string" ||
      data.employee_code.trim().length > 50)
  ) {
    errors.push("Employee code must be a string of at most 50 characters");
  }

  if (
    data.department_id !== undefined &&
    data.department_id !== null &&
    (typeof data.department_id !== "string" ||
      !UUID_REGEX.test(data.department_id))
  ) {
    errors.push("Department ID must be a valid UUID");
  }

  if (
    data.manager_id !== undefined &&
    data.manager_id !== null &&
    (typeof data.manager_id !== "string" ||
      !UUID_REGEX.test(data.manager_id))
  ) {
    errors.push("Manager ID must be a valid UUID");
  }

  if (
    data.job_title !== undefined &&
    data.job_title !== null &&
    (typeof data.job_title !== "string" ||
      data.job_title.trim().length > 100)
  ) {
    errors.push("Job title must be a string of at most 100 characters");
  }

  const unexpectedFields = Object.keys(data).filter(
    (field) => !CREATE_FIELDS.includes(field)
  );

  if (unexpectedFields.length > 0) {
    errors.push(`Unexpected fields: ${unexpectedFields.join(", ")}`);
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

  const unexpectedFields = Object.keys(data).filter(
    (field) => !UPDATE_FIELDS.includes(field)
  );

  if (unexpectedFields.length > 0) {
    errors.push(`Unexpected fields: ${unexpectedFields.join(", ")}`);
  }

  if (
    data.full_name !== undefined &&
    (typeof data.full_name !== "string" ||
      !data.full_name.trim() ||
      data.full_name.trim().length > 150)
  ) {
    errors.push("Full name must be non-empty and at most 150 characters");
  }

  if (
    data.employee_code !== undefined &&
    data.employee_code !== null &&
    (typeof data.employee_code !== "string" ||
      data.employee_code.trim().length > 50)
  ) {
    errors.push("Employee code must be a string of at most 50 characters");
  }

  if (
    data.department_id !== undefined &&
    data.department_id !== null &&
    (typeof data.department_id !== "string" ||
      !UUID_REGEX.test(data.department_id))
  ) {
    errors.push("Department ID must be a valid UUID");
  }

  if (
    data.manager_id !== undefined &&
    data.manager_id !== null &&
    (typeof data.manager_id !== "string" ||
      !UUID_REGEX.test(data.manager_id))
  ) {
    errors.push("Manager ID must be a valid UUID");
  }

  if (
    data.job_title !== undefined &&
    data.job_title !== null &&
    (typeof data.job_title !== "string" ||
      data.job_title.trim().length > 100)
  ) {
    errors.push("Job title must be a string of at most 100 characters");
  }

  return errors;
};

module.exports = {
  validateProfileCreate,
  validateProfileUpdate,
};
