
function createCategoryService(supabase) {
  const table = "resource_categories";

  async function list({ companyId, page, limit }) {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from(table)
      .select(
        "id, name, description, status, created_at, updated_at",
        { count: "exact" }
      )
      .eq("company_id", companyId)
      .order("name", { ascending: true })
      .range(from, to);

    if (error) throw error;

    return {
      data,
      pagination: {
        page,
        limit,
        total: count ?? 0,
        totalPages: Math.ceil((count ?? 0) / limit),
      },
    };
  }

  async function getById({ companyId, categoryId }) {
    const { data, error } = await supabase
      .from(table)
      .select(
        "id, name, description, status, created_at, updated_at"
      )
      .eq("company_id", companyId)
      .eq("id", categoryId)
      .maybeSingle();

    if (error) throw error;

    return data;
  }

  async function create({ companyId, name, description }) {
    const { data, error } = await supabase
      .from(table)
      .insert({
        company_id: companyId,
        name: name.trim(),
        description: description ?? null,
      })
      .select(
        "id, name, description, status, created_at, updated_at"
      )
      .single();

    if (error) throw error;

    return data;
  }

  async function update({ companyId, categoryId, changes }) {
    const updates = {};

    if (changes.name !== undefined) {
      updates.name = changes.name.trim();
    }

    if (changes.description !== undefined) {
      updates.description = changes.description;
    }

    if (changes.status !== undefined) {
      updates.status = changes.status;
    }

    const { data, error } = await supabase
      .from(table)
      .update(updates)
      .eq("company_id", companyId)
      .eq("id", categoryId)
      .select(
        "id, name, description, status, created_at, updated_at"
      )
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

module.exports = { createCategoryService };
