/**
 * Company Configuration Controller
 * CyberProduct Backend Architecture - Pallavi
 *
 * Handles HTTP requests for company tenant management.
 * Enforces RBAC permissions, tenant boundaries, and standard response envelopes.
 */

const companyService = require("./company.service");
const { formatErrorResponse } = require("./errors");
const { UUID_REGEX } = require("./company.validation");
const logger = require("./logger");

/**
 * Creates a new company tenant.
 * Restricted to trusted backend administration / onboarding.
 */
async function createCompany(req, res) {
  try {
    const data = await companyService.createCompany(req.validatedBody);

    return res.status(201).json({
      success: true,
      message: "Company created successfully",
      data
    });
  } catch (error) {
    const { statusCode, body } = formatErrorResponse(error);
    return res.status(statusCode).json(body);
  }
}

/**
 * Retrieves the currently authenticated user's company details.
 * Accessible to all authenticated employees, leads, and admins of the company.
 */
async function getCurrentCompany(req, res) {
  try {
    const companyId = req.user?.company_id;

    if (!companyId) {
      return res.status(401).json({
        success: false,
        message: "Authenticated tenant context is missing"
      });
    }

    const data = await companyService.getCompanyById(companyId);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    const { statusCode, body } = formatErrorResponse(error);
    return res.status(statusCode).json(body);
  }
}

/**
 * Retrieves company details by UUID.
 * Enforces cross-tenant isolation: non-security admins can only retrieve their own company.
 */
async function getCompanyById(req, res) {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: "A valid company UUID is required"
      });
    }

    // Tenant isolation: caller cannot query another company's record
    if (req.user?.company_id && req.user.company_id !== id) {
      logger.warn(`Cross-tenant retrieval blocked: User '${req.user.id}' tried reading company '${id}'`);
      return res.status(403).json({
        success: false,
        message: "Cross-tenant access is strictly prohibited"
      });
    }

    const data = await companyService.getCompanyById(id);

    return res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    const { statusCode, body } = formatErrorResponse(error);
    return res.status(statusCode).json(body);
  }
}

/**
 * Updates company configuration settings.
 * Restricted to Security Administrators of that company.
 */
async function updateSettings(req, res) {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: "A valid company UUID is required"
      });
    }

    // Tenant isolation: admin can only update their own company settings
    if (req.user?.company_id && req.user.company_id !== id) {
      logger.warn(`Cross-tenant settings update blocked: Admin '${req.user.id}' tried updating company '${id}'`);
      return res.status(403).json({
        success: false,
        message: "You can only update settings for your own company"
      });
    }

    const data = await companyService.updateCompanySettings(id, req.validatedSettings);

    return res.status(200).json({
      success: true,
      message: "Company settings updated successfully",
      data
    });
  } catch (error) {
    const { statusCode, body } = formatErrorResponse(error);
    return res.status(statusCode).json(body);
  }
}

/**
 * Updates company status (active | inactive).
 * Restricted to Security Administrators.
 */
async function updateStatus(req, res) {
  try {
    const { id } = req.params;

    if (!UUID_REGEX.test(id)) {
      return res.status(400).json({
        success: false,
        message: "A valid company UUID is required"
      });
    }

    if (req.user?.company_id && req.user.company_id !== id) {
      logger.warn(`Cross-tenant status change blocked: Admin '${req.user.id}' tried changing status of company '${id}'`);
      return res.status(403).json({
        success: false,
        message: "You can only modify status for your own company"
      });
    }

    const data = await companyService.updateCompanyStatus(id, req.validatedStatus);

    return res.status(200).json({
      success: true,
      message: `Company status updated to '${req.validatedStatus}' successfully`,
      data
    });
  } catch (error) {
    const { statusCode, body } = formatErrorResponse(error);
    return res.status(statusCode).json(body);
  }
}

/**
 * Handles DELETE requests on companies.
 * Enforces business rule: Hard deletion is strictly prohibited.
 */
async function deleteCompany(req, res) {
  try {
    companyService.preventHardDelete();
  } catch (error) {
    const { statusCode, body } = formatErrorResponse(error);
    return res.status(statusCode).json(body);
  }
}

module.exports = {
  createCompany,
  getCurrentCompany,
  getCompanyById,
  updateSettings,
  updateStatus,
  deleteCompany
};
