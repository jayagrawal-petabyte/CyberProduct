
function createResourceService(supabase) {
  const table = "resources";

  const RESOURCE_FIELDS = [
    "id",
    "company_id",
    "name",
    "resource_type",
    "identifier",
    "category_id",
    "description",
    "sensitivity",
    "status",
    "created_by",
    "created_at",
    "updated_at",
  ].join(", ");

  // Escape special characters used in PostgREST filter expressions.
  function escapeSearchTerm(value) {
    return value.replace(/[\\%_,().]/g, "\\$&");
  }

  async function list({
    companyId,
    page = 1,
    limit = 20,
    filters = {},
    allowedStatuses,
  }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from(table)
      .select(RESOURCE_FIELDS, { count: "exact" })
      .eq("company_id", companyId);

    // Restrict visible records when the caller supplies allowed statuses.
    if (Array.isArray(allowedStatuses)) {
      query = query.in("status", allowedStatuses);
    }

    if (filters.search) {
      const search = escapeSearchTerm(filters.search.trim());

      if (search) {
        query = query.or(
          `name.ilike.%${search}%,identifier.ilike.%${search}%`
        );
      }
    }

    if (filters.category_id) {
      query = query.eq("category_id", filters.category_id);
    }

    if (filters.resource_type) {
      query = query.eq("resource_type", filters.resource_type);
    }

    if (filters.sensitivity) {
      query = query.eq("sensitivity", filters.sensitivity);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      data: data ?? [],
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  async function getById({
    companyId,
    resourceId,
    allowedStatuses,
  }) {
    let query = supabase
      .from(table)
      .select(RESOURCE_FIELDS)
      .eq("company_id", companyId)
      .eq("id", resourceId);

    if (Array.isArray(allowedStatuses)) {
      query = query.in("status", allowedStatuses);
    }

    const { data, error } = await query.maybeSingle();

    if (error) throw error;

    return data;
  }

  async function create({
    companyId,
    createdBy,
    name,
    resource_type,
    identifier,
    category_id,
    description,
    sensitivity,
  }) {
    const resourceData = {
      company_id: companyId,
      name: name.trim(),
      resource_type,
      identifier: identifier.trim(),
      created_by: createdBy ?? null,
      category_id: category_id ?? null,
      description: description ?? null,
    };

    // Omit sensitivity when absent so the database default applies.
    if (sensitivity !== undefined) {
      resourceData.sensitivity = sensitivity;
    }

    const { data, error } = await supabase
      .from(table)
      .insert(resourceData)
      .select(RESOURCE_FIELDS)
      .single();

    if (error) throw error;

    return data;
  }

  async function update({
    companyId,
    resourceId,
    changes,
  }) {
    const updates = {};

    if (changes.name !== undefined) {
      updates.name = changes.name.trim();
    }

    if (changes.identifier !== undefined) {
      updates.identifier = changes.identifier.trim();
    }

    if (changes.category_id !== undefined) {
      updates.category_id = changes.category_id;
    }

    if (changes.description !== undefined) {
      updates.description = changes.description;
    }

    if (changes.sensitivity !== undefined) {
      updates.sensitivity = changes.sensitivity;
    }

    if (changes.status !== undefined) {
      updates.status = changes.status;
    }

    if (Object.keys(updates).length === 0) {
      throw new Error("No resource fields provided for update.");
    }

    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq("company_id", companyId)
      .eq("id", resourceId)
      .select(RESOURCE_FIELDS)
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  return {
    list,
    getById,
    create,
    update,
  };
}

module.exports = { createResourceService };
