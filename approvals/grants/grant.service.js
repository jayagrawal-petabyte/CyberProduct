
function createGrantService(supabase) {
  if (!supabase) {
    throw new Error("Supabase client is required.");
  }

  function createError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  async function findExistingGrant(requestId, companyId) {
    const { data, error } = await supabase
      .from("access_grants")
      .select("*")
      .eq("request_id", requestId)
      .eq("company_id", companyId)
      .maybeSingle();

    if (error) {
      console.error("Existing grant lookup error:", error.message);
      throw createError(
        "Unable to verify whether a grant already exists.",
        500
      );
    }

    return data;
  }

  function matchesApprovedRequest(grant, request) {
    return (
      grant.request_id === request.id &&
      grant.company_id === request.company_id &&
      grant.user_id === request.requester_id &&
      grant.resource_id === request.resource_id &&
      (grant.device_id ?? null) === (request.device_id ?? null) &&
      grant.granted_by === request.decided_by
    );
  }

  async function createGrant(
    approvedRequest,
    durationMinutes = null
  ) {
    if (
      !approvedRequest ||
      approvedRequest.status !== "approved"
    ) {
      throw createError(
        "Only approved requests can create grants."
      );
    }

    const {
      id: requestId,
      company_id: companyId,
      requester_id: userId,
      resource_id: resourceId,
      device_id: deviceId,
      decided_by: grantedBy
    } = approvedRequest;

    if (
      !requestId ||
      !companyId ||
      !userId ||
      !resourceId ||
      !grantedBy
    ) {
      throw createError(
        "Required approved request details are missing."
      );
    }

    if (
      durationMinutes !== null &&
      (!Number.isInteger(durationMinutes) ||
        durationMinutes <= 0)
    ) {
      throw createError(
        "Grant duration must be a positive integer."
      );
    }

    const startsAt = new Date();

    const expiresAt =
      durationMinutes !== null
        ? new Date(
            startsAt.getTime() +
              durationMinutes * 60 * 1000
          ).toISOString()
        : null;

    const grant = {
      company_id: companyId,
      request_id: requestId,
      user_id: userId,
      resource_id: resourceId,
      device_id: deviceId ?? null,
      granted_by: grantedBy,
      starts_at: startsAt.toISOString(),
      expires_at: expiresAt,
      status: "active"
    };

    const { data, error } = await supabase
      .from("access_grants")
      .insert(grant)
      .select()
      .single();

    if (!error) {
      return data;
    }

    // A grant may already exist if this request was processed
    // earlier or another request reached the database first.
    if (error.code === "23505") {
      const existingGrant = await findExistingGrant(
        requestId,
        companyId
      );

      if (!existingGrant) {
        throw createError(
          "A duplicate grant was detected, but the existing grant could not be found.",
          409
        );
      }

      // Never return an unrelated grant.
      if (!matchesApprovedRequest(existingGrant, approvedRequest)) {
        throw createError(
          "An existing grant does not match this approved request.",
          409
        );
      }

      // Return the existing grant without creating another one
      // or changing its current status or expiry.
      return existingGrant;
    }

    if (error.code === "23514") {
      throw createError(
        "The grant does not satisfy the approved request requirements.",
        400
      );
    }

    console.error("Grant creation error:", error.message);

    throw createError(
      "Unable to create access grant.",
      500
    );
  }

  return { createGrant };
}

module.exports = { createGrantService };
