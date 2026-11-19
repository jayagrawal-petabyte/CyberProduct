
const ALERT_FIELDS = [
  "id",
  "company_id",
  "alert_type",
  "severity",
  "status",
  "title",
  "description",
  "user_id",
  "device_id",
  "resource_id",
  "decision_id",
  "audit_log_id",
  "acknowledged_by",
  "acknowledged_at",
  "resolved_by",
  "resolved_at",
  "resolution_note",
  "created_at",
  "updated_at",
].join(", ");

function createAlertService(supabase) {
  if (!supabase || typeof supabase.from !== "function") {
    throw new Error("A user-scoped Supabase client is required.");
  }

  async function list({
    companyId,
    filters = {},
  }) {
    const offset = (filters.page - 1) * filters.limit;

    let query = supabase
      .from("alerts")
      .select(ALERT_FIELDS, { count: "exact" })
      .eq("company_id", companyId);

    if (filters.alert_type) {
      query = query.eq("alert_type", filters.alert_type);
    }

    if (filters.severity) {
      query = query.eq("severity", filters.severity);
    }

    if (filters.status) {
      query = query.eq("status", filters.status);
    }

    if (filters.user_id) {
      query = query.eq("user_id", filters.user_id);
    }

    if (filters.device_id) {
      query = query.eq("device_id", filters.device_id);
    }

    if (filters.resource_id) {
      query = query.eq("resource_id", filters.resource_id);
    }

    if (filters.from) {
      query = query.gte("created_at", filters.from);
    }

    if (filters.to) {
      query = query.lte("created_at", filters.to);
    }

    const { data, error, count } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(offset, offset + filters.limit - 1);

    if (error) {
      throw error;
    }

    const total = count || 0;

    return {
      data: data || [],
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        totalPages: Math.ceil(total / filters.limit),
        hasNextPage: offset + filters.limit < total,
        hasPreviousPage: filters.page > 1,
      },
    };
  }

  return {
    list,
  };
}

module.exports = {
  createAlertService,
};
