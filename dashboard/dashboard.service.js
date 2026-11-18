
function createDashboardService(supabase) {
  if (!supabase || typeof supabase.from !== "function") {
    throw new Error("A user-scoped Supabase client is required.");
  }

  async function countRecords({
    table,
    timestampColumn,
    companyId,
    filters = {},
    column,
    value,
  }) {
    let query = supabase
      .from(table)
      .select("id", {
        count: "exact",
        head: true,
      })
      .eq("company_id", companyId);

    if (column && value !== undefined) {
      query = query.eq(column, value);
    }

    if (filters.from) {
      query = query.gte(timestampColumn, filters.from);
    }

    if (filters.to) {
      query = query.lte(timestampColumn, filters.to);
    }

    const { count, error } = await query;

    if (error) {
      throw error;
    }

    return count || 0;
  }

  async function getSummary({ companyId, filters = {} }) {
    if (!companyId) {
      throw new Error("Company context is required.");
    }

    const [
      totalAlerts,
      pendingRequests,
      blockedAttempts,
      activeGrants,
    ] = await Promise.all([
      countRecords({
        table: "alerts",
        timestampColumn: "created_at",
        companyId,
        filters,
      }),

      countRecords({
        table: "access_requests",
        timestampColumn: "created_at",
        companyId,
        filters,
        column: "status",
        value: "pending",
      }),

      countRecords({
        table: "access_decisions",
        timestampColumn: "decided_at",
        companyId,
        filters,
        column: "decision",
        value: "BLOCK",
      }),

      countRecords({
        table: "access_grants",
        timestampColumn: "created_at",
        companyId,
        filters,
        column: "status",
        value: "active",
      }),
    ]);

    return {
      summary: {
        totalAlerts,
        pendingRequests,
        blockedAttempts,
        activeGrants,
      },
      filters: {
        from: filters.from || null,
        to: filters.to || null,
      },
      generatedAt: new Date().toISOString(),
    };
  }

  return {
    getSummary,
  };
}

module.exports = {
  createDashboardService,
};
