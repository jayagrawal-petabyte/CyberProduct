
const {
  createUserSupabaseClient,
} = require("../config/supabase");

const logger = require("../config/logger");

const {
  createDashboardService,
} = require("./dashboard.service");

async function getDashboardSummary(req, res) {
  try {
    if (
      !req.user ||
      !req.user.id ||
      !req.user.company_id ||
      !req.accessToken
    ) {
      return res.status(401).json({
        success: false,
        message: "Authenticated user and company context are required.",
      });
    }

    const supabase = createUserSupabaseClient(req.accessToken);

    const dashboardService = createDashboardService(supabase);

    const result = await dashboardService.getSummary({
      companyId: req.user.company_id,
      filters: req.validatedDashboardFilters || {},
    });

    return res.status(200).json({
      success: true,
      message: "Dashboard summary retrieved successfully.",
      data: result,
    });
  } catch (error) {
    logger.error("Failed to retrieve dashboard summary.", {
      message: error.message,
      code: error.code,
      userId: req.user?.id,
      companyId: req.user?.company_id,
    });

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve dashboard summary.",
    });
  }
}

module.exports = {
  getDashboardSummary,
};
