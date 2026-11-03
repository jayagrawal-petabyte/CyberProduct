
const CREATE_FIELDS = [
  "device_name",
  "device_type",
  "os_name",
  "os_version",
  "hardware_id",
  "mac_address",
];

// These values must match your PostgreSQL device_type enum.
const ALLOWED_DEVICE_TYPES = [
  "laptop",
  "desktop",
  "mobile",
  "tablet",
];

const MAC_REGEX = /^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/;

const validateDeviceCreate = (data) => {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Request body must be a valid object"];
  }

  if (
    typeof data.device_name !== "string" ||
    !data.device_name.trim()
  ) {
    errors.push("Device name is required");
  } else if (data.device_name.trim().length > 100) {
    errors.push("Device name cannot exceed 100 characters");
  }

  if (
    typeof data.device_type !== "string" ||
    !ALLOWED_DEVICE_TYPES.includes(data.device_type.toLowerCase())
  ) {
    errors.push(
      `Device type must be one of: ${ALLOWED_DEVICE_TYPES.join(", ")}`
    );
  }

  if (
    data.os_name !== undefined &&
    data.os_name !== null &&
    (typeof data.os_name !== "string" ||
      data.os_name.trim().length > 100)
  ) {
    errors.push("OS name must be a string of at most 100 characters");
  }

  if (
    data.os_version !== undefined &&
    data.os_version !== null &&
    (typeof data.os_version !== "string" ||
      data.os_version.trim().length > 50)
  ) {
    errors.push("OS version must be a string of at most 50 characters");
  }

  if (
    typeof data.hardware_id !== "string" ||
    !data.hardware_id.trim()
  ) {
    errors.push("Hardware ID is required");
  } else if (data.hardware_id.trim().length > 255) {
    errors.push("Hardware ID cannot exceed 255 characters");
  }

  if (
    data.mac_address !== undefined &&
    data.mac_address !== null &&
    (typeof data.mac_address !== "string" ||
      !MAC_REGEX.test(data.mac_address))
  ) {
    errors.push("MAC address must use the format AA:BB:CC:DD:EE:FF");
  }

  const unexpectedFields = Object.keys(data).filter(
    (field) => !CREATE_FIELDS.includes(field)
  );

  if (unexpectedFields.length > 0) {
    errors.push(`Unexpected fields: ${unexpectedFields.join(", ")}`);
  }

  return errors;
};

module.exports = {
  validateDeviceCreate,
};
