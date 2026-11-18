
const logger = require("../config/logger");

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
  departmentTable = "departments",
}) {
  if (!supabase || typeof supabase.from !== "function") {
    throw new Error("Supabase client is required.");
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

  // The database trigger owns policy_version updates.
  // This method only reads the resulting value for the API response.
  async function getCompanyPolicyVersion(companyId) {
    const { data, error } = await supabase
      .from(companiesTable)
      .select("policy_version")
      .eq("id", companyId)
      .maybeSingle();

    if (error) {
      // The policy write has already succeeded. Keep the API response
      // successful and log that this optional lookup was unavailable.
      logger.warn(
        "Could not read the company policy version after policy change.",
        {
          code: error.code,
          message: error.message,
          companyId,
        }
      );

      return null;
    }

    return data?.policy_version ?? null;
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

    if (
      !policyData ||
      typeof policyData !== "object" ||
      Array.isArray(policyData)
    ) {
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

    // The database derives company_id, created_by, updated_by
    // and version through its existing triggers.
    const { data: policy, error } = await supabase
      .from(policiesTable)
      .insert(insertData)
      .select(POLICY_FIELDS)
      .single();

    if (error) {
      throw error;
    }

    const companyPolicyVersion =
      await getCompanyPolicyVersion(companyId);

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

  // Updates an existing policy.
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

    if (
      !changes ||
      typeof changes !== "object" ||
      Array.isArray(changes)
    ) {
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

    const {
      data: existingPolicy,
      error: fetchError,
    } = await supabase
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

    // Optimistic locking is retained.
    // The database trigger increments version automatically.
    const {
      data: updatedPolicy,
      error: updateError,
    } = await supabase
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
      await getCompanyPolicyVersion(companyId);

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
