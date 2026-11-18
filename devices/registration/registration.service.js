
const { createUserSupabaseClient } = require("../../config/supabase");

const registerDevice = async (accessToken, deviceData) => {
  const supabase = createUserSupabaseClient(accessToken);

  const payload = {
    device_name: deviceData.device_name.trim(),
    device_type: deviceData.device_type,
    hardware_id: deviceData.hardware_id.trim(),
    os_name: deviceData.os_name ?? null,
    os_version: deviceData.os_version ?? null,
    mac_address: deviceData.mac_address ?? null
  };

  const { data, error } = await supabase
    .from("devices")
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const err = new Error("This device is already registered");
      err.statusCode = 409;
      throw err;
    }

    if (error.code === "23503") {
      const err = new Error("Invalid device registration reference");
      err.statusCode = 400;
      throw err;
    }

    console.error("Device registration error:", error.message);

    const err = new Error("Unable to register device");
    err.statusCode = 500;
    throw err;
  }

  return data;
};

module.exports = { registerDevice };
