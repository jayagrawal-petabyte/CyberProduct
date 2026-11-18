
const {
  createUserSupabaseClient,
} = require("../../config/supabase");

const logger = require("../../config/logger");

const {
  createAuditLogService,
} = require("./auditLog.service");

async function listAuditLogs(req, res) {
  try {
    if (!req.user || !req.user.id || !req.user.company_id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user and company context are required.",
      });
    }

    const supabase = createUserSupabaseClient(req.accessToken);

    const auditLogService = createAuditLogService(supabase);

    const result = await auditLogService.list({
      companyId: req.user.company_id,
      filters: req.validatedAuditFilters,
    });

    return res.status(200).json({
      success: true,
      message: "Audit logs retrieved successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    logger.error("Failed to retrieve audit logs.", {
      message: error.message,
      code: error.code,
      userId: req.user?.id,
      companyId: req.user?.company_id,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve audit logs.",
    });
  }
}

module.exports = {
  listAuditLogs,
};
