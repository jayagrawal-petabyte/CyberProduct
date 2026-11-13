
const { createUserSupabaseClient } = require("../config/supabase");

const listDepartments = async (accessToken) => {
  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .order("name", { ascending: true });

  if (error) throw error;

  return data;
};

const getDepartmentById = async (accessToken, departmentId) => {
  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("departments")
    .select("*")
    .eq("id", departmentId)
    .maybeSingle();

  if (error) throw error;

  return data;
};

const createDepartment = async (accessToken, departmentData) => {
  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("departments")
    .insert({
      name: departmentData.name.trim(),
      description: departmentData.description ?? null
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const err = new Error("Department already exists");
      err.statusCode = 409;
      throw err;
    }

    throw error;
  }

  return data;
};

const updateDepartment = async (
  accessToken,
  departmentId,
  updates
) => {
  const supabase = createUserSupabaseClient(accessToken);

  const payload = {};

  if (updates.name !== undefined) {
    payload.name = updates.name.trim();
  }

  if (updates.description !== undefined) {
    payload.description = updates.description;
  }

  const { data, error } = await supabase
    .from("departments")
    .update(payload)
    .eq("id", departmentId)
    .select()
    .maybeSingle();

  if (error) {
    if (error.code === "23505") {
      const err = new Error("Department already exists");
      err.statusCode = 409;
      throw err;
    }

    throw error;
  }

  if (!data) {
    const err = new Error(
      "Department not found or update not permitted"
    );
    err.statusCode = 404;
    throw err;
  }

  return data;
};

const deleteDepartment = async (accessToken, departmentId) => {
  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("departments")
    .delete()
    .eq("id", departmentId)
    .select()
    .maybeSingle();

  if (error) throw error;

  if (!data) {
    const err = new Error(
      "Department not found or delete not permitted"
    );
    err.statusCode = 404;
    throw err;
  }

  return data;
};

module.exports = {
  listDepartments,
  getDepartmentById,
  createDepartment,
  updateDepartment,
  deleteDepartment
};
