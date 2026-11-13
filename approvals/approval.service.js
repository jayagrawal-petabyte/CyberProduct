
function createApprovalService(supabase) {
  if (!supabase) {
    throw new Error("Supabase client is required.");
  }

  const table = "access_requests";

  const DECISION_FIELDS = [
    "id",
    "company_id",
    "requester_id",
    "resource_id",
    "device_id",
    "reason",
    "requested_duration_minutes",
    "status",
    "assigned_lead_id",
    "decided_by",
    "decided_at",
    "decision_reason",
    "decided_on_behalf_of",
    "created_at",
    "updated_at",
  ].join(", ");

  function createServiceError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  async function decideRequest({
    requestId,
    companyId,
    status,
    decisionReason = null,
  }) {
    if (!requestId || !companyId) {
      throw createServiceError(
        "Request ID and company ID are required.",
        400
      );
    }

    if (!["approved", "rejected"].includes(status)) {
      throw createServiceError(
        "Invalid decision status.",
        400
      );
    }

    if (
      decisionReason !== null &&
      (typeof decisionReason !== "string" ||
        decisionReason.trim().length > 1000)
    ) {
      throw createServiceError(
        "Decision reason must not exceed 1000 characters.",
        400
      );
    }

    const updateData = {
      status,
      decision_reason: decisionReason?.trim() || null,
    };

    const { data, error } = await supabase
      .from(table)
      .update(updateData)
      .eq("id", requestId)
      .eq("company_id", companyId)
      .eq("status", "pending")
      .select(DECISION_FIELDS)
      .maybeSingle();

    if (error) {
      if (error.code === "42501") {
        throw createServiceError(
          "You are not authorized to decide this request.",
          403
        );
      }

      if (error.code === "23514") {
        throw createServiceError(
          "The requested status transition is not allowed.",
          409
        );
      }

      console.error("Approval service error:", error.message);

      throw createServiceError(
        "Unable to process the access request decision.",
        500
      );
    }

    if (!data) {
      throw createServiceError(
        "Pending request not found or not available for decision.",
        404
      );
    }

    return data;
  }

  async function approveRequest({
    requestId,
    companyId,
    decisionReason = null,
  }) {
    return decideRequest({
      requestId,
      companyId,
      status: "approved",
      decisionReason,
    });
  }

  async function rejectRequest({
    requestId,
    companyId,
    decisionReason = null,
  }) {
    return decideRequest({
      requestId,
      companyId,
      status: "rejected",
      decisionReason,
    });
  }
  async function getPendingRequest({
  requestId,
  companyId
}) {
  if (!requestId || !companyId) {
    throw createServiceError(
      "Request ID and company ID are required.",
      400
    );
  }

  const { data, error } = await supabase
    .from(table)
    .select(DECISION_FIELDS)
    .eq("id", requestId)
    .eq("company_id", companyId)
    .eq("status", "pending")
    .maybeSingle();

  if (error) {
    console.error("Pending request lookup error:", error.message);

    throw createServiceError(
      "Unable to retrieve the pending access request.",
      500
    );
  }

  if (!data) {
    throw createServiceError(
      "Pending request not found or not available for decision.",
      404
    );
  }

  return data;
}

  return {
  getPendingRequest,
  approveRequest,
  rejectRequest,
};

}

module.exports = { createApprovalService };
