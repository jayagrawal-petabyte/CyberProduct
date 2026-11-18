
const { createUserSupabaseClient } = require("../config/supabase");

const listDevices = async (accessToken) => {
  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

const getDeviceById = async (accessToken, deviceId) => {
  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("devices")
    .select("*")
    .eq("id", deviceId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

const updateDevice = async (accessToken, deviceId, updates) => {
  const supabase = createUserSupabaseClient(accessToken);

  const allowedFields = [
    "device_name",
    "device_type",
    "os_name",
    "os_version",
    "mac_address"
  ];

  const payload = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      payload[field] = updates[field];
    }
  });

  const { data, error } = await supabase
    .from("devices")
    .update(payload)
    .eq("id", deviceId)
    .select()
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const err = new Error("Device not found or update not permitted");
    err.statusCode = 404;
    throw err;
  }

  return data;
};

const revokeDevice = async (accessToken, deviceId, reason) => {
  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("devices")
    .update({
      status: "revoked",
      revoke_reason: reason || null
    })
    .eq("id", deviceId)
    .select()
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const err = new Error("Device not found or revoke not permitted");
    err.statusCode = 404;
    throw err;
  }

  return data;
};

module.exports = {
  listDevices,
  getDeviceById,
  updateDevice,
  revokeDevice
};
