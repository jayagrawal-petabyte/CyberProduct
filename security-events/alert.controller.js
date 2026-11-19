
const {
  createUserSupabaseClient,
} = require("../config/supabase");

const logger = require("../config/logger");

const {
  createAlertService,
} = require("./alert.service");

async function listAlerts(req, res) {
  try {
    if (!req.user || !req.user.id || !req.user.company_id) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user and company context are required.",
      });
    }

    const supabase = createUserSupabaseClient(req.accessToken);

    const alertService = createAlertService(supabase);

    const result = await alertService.list({
      companyId: req.user.company_id,
      filters: req.validatedAlertFilters,
    });

    return res.status(200).json({
      success: true,
      message: "Alerts retrieved successfully.",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    logger.error("Failed to retrieve alerts.", {
      message: error.message,
      code: error.code,
      userId: req.user?.id,
      companyId: req.user?.company_id,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve alerts.",
    });
  }
}

module.exports = {
  listAlerts,
};
