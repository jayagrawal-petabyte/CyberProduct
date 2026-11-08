
const CREATE_FIELDS = [
  "device_name",
  "device_type",
  "os_name",
  "os_version",
  "hardware_id",
  "mac_address"
];

const UPDATE_FIELDS = [
  "device_name",
  "device_type",
  "os_name",
  "os_version",
  "mac_address"
];

const DEVICE_TYPES = ["laptop", "desktop", "mobile", "tablet"];

const MAC_REGEX =
  /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

const validateDeviceCreate = (data) => {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Request body must be a valid object"];
  }

  if (
    typeof data.device_name !== "string" ||
    !data.device_name.trim() ||
    data.device_name.trim().length > 100
  ) {
    errors.push("Device name must contain 1 to 100 characters");
  }

  if (!DEVICE_TYPES.includes(data.device_type)) {
    errors.push(`Device type must be one of: ${DEVICE_TYPES.join(", ")}`);
  }

  if (
    data.os_name !== undefined &&
    data.os_name !== null &&
    (typeof data.os_name !== "string" || data.os_name.length > 100)
  ) {
    errors.push("OS name must be a string of at most 100 characters");
  }

  if (
    data.os_version !== undefined &&
    data.os_version !== null &&
    (typeof data.os_version !== "string" || data.os_version.length > 50)
  ) {
    errors.push("OS version must be a string of at most 50 characters");
  }

  if (
    typeof data.hardware_id !== "string" ||
    !data.hardware_id.trim() ||
    data.hardware_id.length > 255
  ) {
    errors.push("Hardware ID is required and cannot exceed 255 characters");
  }

  if (
    data.mac_address !== undefined &&
    data.mac_address !== null &&
    (typeof data.mac_address !== "string" ||
      !MAC_REGEX.test(data.mac_address))
  ) {
    errors.push("Invalid MAC address format");
  }

  const unexpectedFields = Object.keys(data).filter(
    (field) => !CREATE_FIELDS.includes(field)
  );

  if (unexpectedFields.length > 0) {
    errors.push(`Unexpected fields: ${unexpectedFields.join(", ")}`);
  }

  return errors;
};

const validateDeviceUpdate = (data) => {
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
    data.device_name !== undefined &&
    (
      typeof data.device_name !== "string" ||
      !data.device_name.trim() ||
      data.device_name.trim().length > 100
    )
  ) {
    errors.push("Device name must contain 1 to 100 characters");
  }

  if (
    data.device_type !== undefined &&
    !DEVICE_TYPES.includes(data.device_type)
  ) {
    errors.push(`Device type must be one of: ${DEVICE_TYPES.join(", ")}`);
  }

  if (
    data.os_name !== undefined &&
    data.os_name !== null &&
    (typeof data.os_name !== "string" || data.os_name.length > 100)
  ) {
    errors.push("OS name must be a string of at most 100 characters");
  }

  if (
    data.os_version !== undefined &&
    data.os_version !== null &&
    (typeof data.os_version !== "string" || data.os_version.length > 50)
  ) {
    errors.push("OS version must be a string of at most 50 characters");
  }

  if (
    data.mac_address !== undefined &&
    data.mac_address !== null &&
    (typeof data.mac_address !== "string" ||
      !MAC_REGEX.test(data.mac_address))
  ) {
    errors.push("Invalid MAC address format");
  }

  return errors;
};

module.exports = {
  validateDeviceCreate,
  validateDeviceUpdate
};
