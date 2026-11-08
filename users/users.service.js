
const { createUserSupabaseClient } = require("../config/supabase");

const getProfiles = async (accessToken) => {
  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return data;
};

const getProfileById = async (accessToken, profileId) => {
  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", profileId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

const updateProfile = async (accessToken, profileId, updates) => {
  const supabase = createUserSupabaseClient(accessToken);

  const allowedFields = [
    "full_name",
    "employee_code",
    "department_id",
    "manager_id",
    "job_title"
  ];

  const payload = {};

  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      payload[field] = updates[field];
    }
  });

  const { data, error } = await supabase
    .from("profiles")
    .update(payload)
    .eq("id", profileId)
    .select()
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const err = new Error("Profile not found or update not permitted");
    err.statusCode = 404;
    throw err;
  }

  return data;
};

module.exports = {
  getProfiles,
  getProfileById,
  updateProfile
};
