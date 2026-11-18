
const { decodeCursor } = require("./auditLog.validation");

const AUDIT_LOG_FIELDS = [
  "id",
  "company_id",
  "event_type",
  "actor_id",
  "actor_role",
  "target_type",
  "target_id",
  "outcome",
  "reason_code",
  "ip_address",
  "metadata",
  "prev_hash",
  "entry_hash",
  "created_at",
].join(", ");

function encodeCursor(record) {
  return Buffer.from(
    JSON.stringify({
      created_at: record.created_at,
      id: String(record.id),
    })
  ).toString("base64url");
}

function createAuditLogService(supabase) {
  if (!supabase || typeof supabase.from !== "function") {
    throw new Error("A user-scoped Supabase client is required.");
  }

  async function list({
    companyId,
    filters = {},
  }) {
    let query = supabase
      .from("audit_logs")
      .select(AUDIT_LOG_FIELDS)
      .eq("company_id", companyId);

    if (filters.event_type) {
      query = query.eq("event_type", filters.event_type);
    }

    if (filters.outcome) {
      query = query.eq("outcome", filters.outcome);
    }

    if (filters.actor_id) {
      query = query.eq("actor_id", filters.actor_id);
    }

    if (filters.target_type) {
      query = query.eq("target_type", filters.target_type);
    }

    if (filters.target_id) {
      query = query.eq("target_id", filters.target_id);
    }

    if (filters.from) {
      query = query.gte("created_at", filters.from);
    }

    if (filters.to) {
      query = query.lte("created_at", filters.to);
    }

    if (filters.cursor) {
      const cursor = decodeCursor(filters.cursor);

      if (!cursor) {
        const error = new Error("Invalid audit-log cursor.");
        error.statusCode = 400;
        throw error;
      }

      // Keyset pagination: older timestamp, or same timestamp
      // with a smaller monotonic audit-log ID.
      const timestamp = cursor.created_at;
      const id = cursor.id;

      query = query.or(
        `created_at.lt.${timestamp},and(created_at.eq.${timestamp},id.lt.${id})`
      );
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .limit(filters.limit + 1);

    if (error) {
      throw error;
    }

    const records = data || [];
    const hasMore = records.length > filters.limit;
    const items = hasMore
      ? records.slice(0, filters.limit)
      : records;

    return {
      data: items,
      pagination: {
        limit: filters.limit,
        hasMore,
        nextCursor: hasMore && items.length
          ? encodeCursor(items[items.length - 1])
          : null,
      },
    };
  }

  return {
    list,
  };
}

module.exports = {
  createAuditLogService,
};
