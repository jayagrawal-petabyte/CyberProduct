
const REGISTRATION_FIELDS = [
  "device_name",
  "device_type",
  "os_name",
  "os_version",
  "hardware_id",
  "mac_address",
];

const validateRegistration = (data) => {
  const errors = [];

  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return ["Request body must be a valid object"];
  }

  if (
    typeof data.device_name !== "string" ||
    !data.device_name.trim()
  ) {
    errors.push("Device name is required");
  }

  if (
    typeof data.device_type !== "string" ||
    !data.device_type.trim()
  ) {
    errors.push("Device type is required");
  }

  if (
    typeof data.hardware_id !== "string" ||
    !data.hardware_id.trim()
  ) {
    errors.push("Hardware ID is required");
  }

  if (
    data.os_name !== undefined &&
    data.os_name !== null &&
    typeof data.os_name !== "string"
  ) {
    errors.push("OS name must be a string");
  }

  if (
    data.os_version !== undefined &&
    data.os_version !== null &&
    typeof data.os_version !== "string"
  ) {
    errors.push("OS version must be a string");
  }

  if (
    data.mac_address !== undefined &&
    data.mac_address !== null &&
    (typeof data.mac_address !== "string" ||
      !/^([0-9A-Fa-f]{2}:){5}[0-9A-Fa-f]{2}$/.test(data.mac_address))
  ) {
    errors.push("Invalid MAC address format");
  }

  const unexpectedFields = Object.keys(data).filter(
    (field) => !REGISTRATION_FIELDS.includes(field)
  );

  if (unexpectedFields.length > 0) {
    errors.push(`Unexpected fields: ${unexpectedFields.join(", ")}`);
  }

  return errors;
};

module.exports = {
  validateRegistration,
};
