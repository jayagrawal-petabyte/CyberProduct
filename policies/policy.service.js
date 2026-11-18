
const POLICY_FIELDS = [
  "id",
  "company_id",
  "name",
  "description",
  "effect",
  "resource_id",
  "category_id",
  "applies_to_role",
  "applies_to_department_id",
  "require_authorized_network",
  "require_compliant_device",
  "max_grant_minutes",
  "priority",
  "extra_conditions",
  "status",
  "version",
  "created_by",
  "updated_by",
  "created_at",
  "updated_at",
].join(", ");

const ALLOWED_CREATE_FIELDS = [
  "name",
  "description",
  "effect",
  "resource_id",
  "category_id",
  "applies_to_role",
  "applies_to_department_id",
  "require_authorized_network",
  "require_compliant_device",
  "max_grant_minutes",
  "priority",
  "extra_conditions",
];

const ALLOWED_UPDATE_FIELDS = [...ALLOWED_CREATE_FIELDS];

function createPolicyService({
  supabase,
  auditService,
  departmentTable = "departments",
}) {
  if (!supabase) {
    throw new Error("Supabase client is required.");
  }

  if (
    !auditService ||
    typeof auditService.recordPolicyEvent !== "function"
  ) {
    throw new Error(
      "An auditService with recordPolicyEvent() is required."
    );
  }

  const policiesTable = "policies";
  const resourcesTable = "resources";
  const categoriesTable = "resource_categories";
  const companiesTable = "companies";

  function createServiceError(message, statusCode = 400) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  // Removes unsupported fields and trims string values.
  function pickAllowedFields(data, allowedFields) {
    const result = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        const value = data[field];

        result[field] =
          typeof value === "string" && field !== "effect"
            ? value.trim()
            : value;
      }
    }

    return result;
  }

  // Checks that a referenced record belongs to the same company.
  async function verifyCompanyReference({
    table,
    recordId,
    companyId,
    fieldName,
  }) {
    if (recordId === undefined || recordId === null) {
      return;
    }

    const { data, error } = await supabase
      .from(table)
      .select("id")
      .eq("id", recordId)
      .eq("company_id", companyId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    if (!data) {
      throw createServiceError(
        `${fieldName} does not exist or does not belong to this company.`,
        400
      );
    }
  }

  // Validates resource, category and department ownership.
  async function validateReferences({
    companyId,
    resourceId,
    categoryId,
    departmentId,
  }) {
    if (resourceId && categoryId) {
      throw createServiceError(
        "A policy cannot target both a resource and a category.",
        400
      );
    }

    await verifyCompanyReference({
      table: resourcesTable,
      recordId: resourceId,
      companyId,
      fieldName: "resource_id",
    });

    await verifyCompanyReference({
      table: categoriesTable,
      recordId: categoryId,
      companyId,
      fieldName: "category_id",
    });

    await verifyCompanyReference({
      table: departmentTable,
      recordId: departmentId,
      companyId,
      fieldName: "applies_to_department_id",
    });
  }

  // Increments companies.policy_version using optimistic locking.
  async function incrementCompanyPolicyVersion(companyId) {
    const maxAttempts = 5;

    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      const { data: company, error: fetchError } = await supabase
        .from(companiesTable)
        .select("policy_version")
        .eq("id", companyId)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!company) {
        throw createServiceError("Company not found.", 404);
      }

      const currentVersion = company.policy_version ?? 0;

      if (
        !Number.isSafeInteger(currentVersion) ||
        currentVersion < 0
      ) {
        throw new Error("Company policy version is invalid.");
      }

      const nextVersion = currentVersion + 1;

      let updateQuery = supabase
        .from(companiesTable)
        .update({
          policy_version: nextVersion,
        })
        .eq("id", companyId);

      // Handle NULL separately because SQL equality does not match NULL.
      if (company.policy_version === null) {
        updateQuery = updateQuery.is("policy_version", null);
      } else {
        updateQuery = updateQuery.eq(
          "policy_version",
          currentVersion
        );
      }

      const { data: updatedCompany, error: updateError } =
        await updateQuery
          .select("policy_version")
          .maybeSingle();

      if (updateError) {
        throw updateError;
      }

      if (updatedCompany) {
        return updatedCompany.policy_version;
      }
    }

    throw createServiceError(
      "Could not update company policy version due to concurrent changes. Please retry.",
      409
    );
  }

  // Records a policy audit event.
  async function recordAuditEvent({
    eventType,
    companyId,
    actorId,
    entityId,
    before,
    after,
  }) {
    await auditService.recordPolicyEvent({
      eventType,
      companyId,
      actorId,
      entityId,
      before,
      after,
    });
  }

  // Creates a new policy.
  async function create({
    companyId,
    actorId,
    policyData,
  }) {
    if (!companyId || !actorId) {
      throw createServiceError(
        "Company ID and actor ID are required."
      );
    }

    if (!policyData || typeof policyData !== "object") {
      throw createServiceError("Policy data is required.");
    }

    const insertData = pickAllowedFields(
      policyData,
      ALLOWED_CREATE_FIELDS
    );

    if (!insertData.name || !insertData.effect) {
      throw createServiceError(
        "Policy name and effect are required."
      );
    }

    if (
      insertData.max_grant_minutes !== undefined &&
      insertData.max_grant_minutes !== null &&
      (
        !Number.isInteger(insertData.max_grant_minutes) ||
        insertData.max_grant_minutes <= 0
      )
    ) {
      throw createServiceError(
        "max_grant_minutes must be a positive integer or null."
      );
    }

    if (
      insertData.priority !== undefined &&
      (
        !Number.isInteger(insertData.priority) ||
        insertData.priority < 0
      )
    ) {
      throw createServiceError(
        "priority must be a non-negative integer."
      );
    }

    await validateReferences({
      companyId,
      resourceId: insertData.resource_id,
      categoryId: insertData.category_id,
      departmentId: insertData.applies_to_department_id,
    });

    const finalInsertData = {
      ...insertData,
      company_id: companyId,
      created_by: actorId,
      updated_by: actorId,
    };

    const { data: policy, error } = await supabase
      .from(policiesTable)
      .insert(finalInsertData)
      .select(POLICY_FIELDS)
      .single();

    if (error) {
      throw error;
    }

    const companyPolicyVersion =
      await incrementCompanyPolicyVersion(companyId);

    await recordAuditEvent({
      eventType: "policy.created",
      companyId,
      actorId,
      entityId: policy.id,
      before: null,
      after: policy,
    });

    return {
      policy,
      companyPolicyVersion,
    };
  }

  // Lists policies belonging to the authenticated company.
  async function list({
    companyId,
    page = 1,
    limit = 20,
    filters = {},
  }) {
    if (!companyId) {
      throw createServiceError("Company ID is required.");
    }

    if (
      !Number.isInteger(page) ||
      page < 1 ||
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 100
    ) {
      throw createServiceError(
        "Invalid pagination parameters."
      );
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(policiesTable)
      .select(POLICY_FIELDS, { count: "exact" })
      .eq("company_id", companyId);

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.effect) {
      query = query.eq("effect", filters.effect);
    }

    if (filters.resource_id) {
      query = query.eq("resource_id", filters.resource_id);
    }

    if (filters.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters.applies_to_role) {
      query = query.eq(
        "applies_to_role",
        filters.applies_to_role
      );
    }

    const { data, error, count } = await query
      .order("priority", { ascending: true })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      throw error;
    }

    const total = count ?? 0;

    return {
      data: data ?? [],
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // Fetches one policy within the authenticated company.
  async function getById({
    companyId,
    policyId,
  }) {
    if (!companyId || !policyId) {
      throw createServiceError(
        "Company ID and policy ID are required."
      );
    }

    const { data, error } = await supabase
      .from(policiesTable)
      .select(POLICY_FIELDS)
      .eq("company_id", companyId)
      .eq("id", policyId)
      .maybeSingle();

    if (error) {
      throw error;
    }

    return data;
  }

  // Updates an existing policy and increments its version.
  async function update({
    companyId,
    policyId,
    actorId,
    changes,
  }) {
    if (!companyId || !actorId || !policyId) {
      throw createServiceError(
        "Company ID, policy ID and actor ID are required."
      );
    }

    if (!changes || typeof changes !== "object") {
      throw createServiceError(
        "Policy update data is required."
      );
    }

    const unsupportedFields = Object.keys(changes).filter(
      (field) => !ALLOWED_UPDATE_FIELDS.includes(field)
    );

    if (unsupportedFields.length > 0) {
      throw createServiceError(
        `Unsupported update fields: ${unsupportedFields.join(", ")}.`
      );
    }

    const updates = pickAllowedFields(
      changes,
      ALLOWED_UPDATE_FIELDS
    );

    if (Object.keys(updates).length === 0) {
      throw createServiceError(
        "No valid policy fields provided for update."
      );
    }

    if (
      updates.name !== undefined &&
      !updates.name
    ) {
      throw createServiceError(
        "Policy name cannot be empty."
      );
    }

    if (
      updates.max_grant_minutes !== undefined &&
      updates.max_grant_minutes !== null &&
      (
        !Number.isInteger(updates.max_grant_minutes) ||
        updates.max_grant_minutes <= 0
      )
    ) {
      throw createServiceError(
        "max_grant_minutes must be a positive integer or null."
      );
    }

    if (
      updates.priority !== undefined &&
      (
        !Number.isInteger(updates.priority) ||
        updates.priority < 0
      )
    ) {
      throw createServiceError(
        "priority must be a non-negative integer."
      );
    }

    const { data: existingPolicy, error: fetchError } =
      await supabase
        .from(policiesTable)
        .select(POLICY_FIELDS)
        .eq("company_id", companyId)
        .eq("id", policyId)
        .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    if (!existingPolicy) {
      throw createServiceError("Policy not found.", 404);
    }

    const mergedPolicy = {
      ...existingPolicy,
      ...updates,
    };

    await validateReferences({
      companyId,
      resourceId: mergedPolicy.resource_id,
      categoryId: mergedPolicy.category_id,
      departmentId: mergedPolicy.applies_to_department_id,
    });

    const currentVersion = existingPolicy.version;

    if (
      !Number.isSafeInteger(currentVersion) ||
      currentVersion < 1
    ) {
      throw new Error("Existing policy version is invalid.");
    }

    updates.version = currentVersion + 1;
    updates.updated_by = actorId;

    const { data: updatedPolicy, error: updateError } =
      await supabase
        .from(policiesTable)
        .update(updates)
        .eq("company_id", companyId)
        .eq("id", policyId)
        .eq("version", currentVersion)
        .select(POLICY_FIELDS)
        .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!updatedPolicy) {
      throw createServiceError(
        "Policy was modified by another request. Please fetch the latest version and retry.",
        409
      );
    }

    const companyPolicyVersion =
      await incrementCompanyPolicyVersion(companyId);

    await recordAuditEvent({
      eventType: "policy.updated",
      companyId,
      actorId,
      entityId: policyId,
      before: existingPolicy,
      after: updatedPolicy,
    });

    return {
      policy: updatedPolicy,
      companyPolicyVersion,
    };
  }

  return {
    create,
    list,
    getById,
    update,
  };
}

module.exports = {
  createPolicyService,
};
