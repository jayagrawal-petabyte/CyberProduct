
const {
  createUserSupabaseClient
} = require("../config/supabase");

async function createAccessRequest({
  userId,
  companyId,
  accessToken,
  requestData
}) {
  const supabase = createUserSupabaseClient(accessToken);

  const { data, error } = await supabase
    .from("access_requests")
    .insert({
      company_id: companyId,
      requester_id: userId,
      resource_id: requestData.resource_id,
      device_id: requestData.device_id,
      reason: requestData.reason,
      requested_duration_minutes:
        requestData.requested_duration_minutes
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      const duplicateError = new Error(
        "A pending request already exists for this resource"
      );
      duplicateError.statusCode = 409;
      throw duplicateError;
    }

    if (error.code === "23503") {
      const referenceError = new Error(
        "The selected resource or device does not exist"
      );
      referenceError.statusCode = 400;
      throw referenceError;
    }

    console.error("Supabase access request error:", error.message);

    const serverError = new Error("Unable to create access request");
    serverError.statusCode = 500;
    throw serverError;
  }

  return data;
}

module.exports = { createAccessRequest };
