
function createPolicyEvaluator(supabase) {
  if (!supabase) {
    throw new Error("Supabase client is required.");
  }

  function createError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  async function evaluateAccessRequest(request) {
   if (!request || !["pending", "approved"].includes(request.status)) {
  throw createError(
    "Policy evaluation requires a pending or approved access request."
  );
}

    const {
      company_id: companyId,
      requester_id: requesterId,
      resource_id: resourceId,
      device_id: deviceId,
      requested_duration_minutes: requestedDuration
    } = request;

    if (!companyId || !requesterId || !resourceId) {
      throw createError("Required request details are missing.");
    }

    // Fetch requester, resource and company settings.
    const [
      profileResult,
      resourceResult,
      companyResult
    ] = await Promise.all([
      supabase
        .from("profiles")
        .select("id, company_id, role, department_id")
        .eq("id", requesterId)
        .eq("company_id", companyId)
        .maybeSingle(),

      supabase
        .from("resources")
        .select("id, company_id, category_id, status")
        .eq("id", resourceId)
        .eq("company_id", companyId)
        .maybeSingle(),

      supabase
        .from("companies")
        .select("id, settings")
        .eq("id", companyId)
        .maybeSingle()
    ]);

    if (profileResult.error) throw profileResult.error;
    if (resourceResult.error) throw resourceResult.error;
    if (companyResult.error) throw companyResult.error;

    const profile = profileResult.data;
    const resource = resourceResult.data;
    const company = companyResult.data;

    if (!profile || !resource || !company) {
      throw createError(
        "Requester, resource or company could not be found.",
        404
      );
    }

    if (resource.status !== "active") {
      throw createError(
        "Access cannot be granted to an inactive resource.",
        403
      );
    }

    // Fetch active policies for this company.
    const { data: policies, error: policyError } = await supabase
      .from("policies")
      .select(
        "id, name, effect, resource_id, category_id, applies_to_role, applies_to_department_id, max_grant_minutes, priority, require_authorized_network, require_compliant_device, extra_conditions, created_at"
      )
      .eq("company_id", companyId)
      .eq("status", "active")
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false });

    if (policyError) throw policyError;

    // Match resource/category, role and department.
    const matchingPolicies = (policies || []).filter((policy) => {
      const resourceMatches =
        !policy.resource_id ||
        policy.resource_id === resource.id;

      const categoryMatches =
        !policy.category_id ||
        policy.category_id === resource.category_id;

      const roleMatches =
        !policy.applies_to_role ||
        policy.applies_to_role === profile.role;

      const departmentMatches =
        !policy.applies_to_department_id ||
        policy.applies_to_department_id === profile.department_id;

      return (
        resourceMatches &&
        categoryMatches &&
        roleMatches &&
        departmentMatches
      );
    });

    // Lowest numeric priority wins. Newest policy wins ties.
    const selectedPolicy = matchingPolicies[0] || null;

    // Fail closed if no active policy applies.
    if (!selectedPolicy) {
      throw createError(
        "No active access policy matches this request.",
        403
      );
    }

    const effect = String(selectedPolicy.effect).toUpperCase();

    if (effect === "BLOCK") {
      throw createError(
        `Access blocked by policy: ${selectedPolicy.name}.`,
        403
      );
    }

    if (!["ALLOW", "REQUIRES_APPROVAL"].includes(effect)) {
      throw createError(
        `Unsupported policy effect: ${selectedPolicy.effect}.`,
        500
      );
    }

    // The request is already approved before grant creation.
    // Therefore REQUIRES_APPROVAL has been satisfied.

    // Fetch and validate the registered device when required.
    let device = null;

    if (
      selectedPolicy.require_compliant_device ||
      selectedPolicy.require_authorized_network
    ) {
      if (!deviceId) {
        throw createError(
          "This policy requires a registered device.",
          403
        );
      }

      const { data, error } = await supabase
        .from("devices")
        .select(
          "id, company_id, owner_id, status, compliance_status"
        )
        .eq("id", deviceId)
        .eq("company_id", companyId)
        .eq("owner_id", requesterId)
        .maybeSingle();

      if (error) throw error;

      device = data;

      if (!device) {
        throw createError(
          "The registered device could not be found.",
          404
        );
      }

      if (device.status !== "active") {
        throw createError(
          "The device is not active.",
          403
        );
      }
    }

    // Enforce device compliance.
    if (selectedPolicy.require_compliant_device) {
      if (device.compliance_status !== "compliant") {
        throw createError(
          "The device is not compliant with company security requirements.",
          403
        );
      }
    }

    // Enforce authorized network.
if (selectedPolicy.require_authorized_network) {
  const { data: networkCheck, error: checkError } =
    await supabase
      .from("device_network_checks")
      .select(
        "id, company_id, device_id, network_id, result, checked_at"
      )
      .eq("company_id", companyId)
      .eq("device_id", deviceId)
      .order("checked_at", { ascending: false })
      .limit(1)
      .maybeSingle();

  if (checkError) throw checkError;

  if (
    !networkCheck ||
    !networkCheck.network_id ||
    networkCheck.result !== "compliant"
  ) {
    throw createError(
      "No compliant authorized network check is available.",
      403
    );
  }

  // Check whether the network check is still fresh.
  const staleAfterMinutes =
    company.settings?.stale_after_minutes ?? 60;

  if (
    !Number.isInteger(staleAfterMinutes) ||
    staleAfterMinutes <= 0
  ) {
    throw createError(
      "Company network-check freshness setting is invalid.",
      500
    );
  }

  const checkedAt = new Date(networkCheck.checked_at).getTime();
  const currentTime = Date.now();

  if (
    !Number.isFinite(checkedAt) ||
    checkedAt > currentTime ||
    currentTime - checkedAt > staleAfterMinutes * 60 * 1000
  ) {
    throw createError(
      "The latest network check is outdated. Please perform a new network check.",
      403
    );
  }

  // Verify that the network is authorized and active.
  const { data: network, error: networkError } =
    await supabase
      .from("corporate_networks")
      .select("id, company_id, is_authorized, is_active")
      .eq("id", networkCheck.network_id)
      .eq("company_id", companyId)
      .maybeSingle();

  if (networkError) throw networkError;

  if (
    !network ||
    !network.is_authorized ||
    !network.is_active
  ) {
    throw createError(
      "The device is not connected to an authorized active network.",
      403
    );
  }
}
    if (selectedPolicy.require_authorized_network) {
      const { data: networkCheck, error: checkError } =
        await supabase
          .from("device_network_checks")
          .select(
            "id, company_id, device_id, network_id, result, checked_at"
          )
          .eq("company_id", companyId)
          .eq("device_id", deviceId)
          .order("checked_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (checkError) throw checkError;

      if (
        !networkCheck ||
        !networkCheck.network_id ||
        networkCheck.result !== "compliant"
      ) {
        throw createError(
          "No compliant authorized network check is available.",
          403
        );
      }

      const { data: network, error: networkError } =
        await supabase
          .from("corporate_networks")
          .select("id, company_id, is_authorized, is_active")
          .eq("id", networkCheck.network_id)
          .eq("company_id", companyId)
          .maybeSingle();

      if (networkError) throw networkError;

      if (
        !network ||
        !network.is_authorized ||
        !network.is_active
      ) {
        throw createError(
          "The device is not connected to an authorized active network.",
          403
        );
      }
    }

    // Resolve company default duration.
    const companyDefault =
      company.settings?.default_grant_minutes ?? 60;

    if (
      !Number.isInteger(companyDefault) ||
      companyDefault <= 0
    ) {
      throw createError(
        "Company default grant duration is invalid.",
        500
      );
    }

    const policyMaximum =
      selectedPolicy.max_grant_minutes ?? null;

    if (
      policyMaximum !== null &&
      (!Number.isInteger(policyMaximum) || policyMaximum <= 0)
    ) {
      throw createError(
        "Policy maximum grant duration is invalid.",
        500
      );
    }

    let durationMinutes;

    if (
      requestedDuration !== null &&
      requestedDuration !== undefined
    ) {
      if (
        !Number.isInteger(requestedDuration) ||
        requestedDuration <= 0
      ) {
        throw createError(
          "Requested grant duration must be a positive integer."
        );
      }

      if (
        policyMaximum !== null &&
        requestedDuration > policyMaximum
      ) {
        throw createError(
          `Requested duration exceeds the policy maximum of ${policyMaximum} minutes.`,
          403
        );
      }

      durationMinutes = requestedDuration;
    } else {
      durationMinutes =
        policyMaximum === null
          ? companyDefault
          : Math.min(companyDefault, policyMaximum);
    }

    return {
      durationMinutes,
      selectedPolicy,
      matchingPolicies
    };
  }

  return {
  evaluateAccessRequest,
};
}

module.exports = { createPolicyEvaluator };
