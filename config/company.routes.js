/**
 * Company Configuration Routes
 * CyberProduct Backend Architecture - Pallavi
 *
 * Defines API endpoints for company tenant management.
 * Enforces authentication and Security Administrator permissions.
 */

const express = require("express");
const {
  requireAuthenticatedUser,
  requireSecurityAdmin
} = require("../auth/auth.middleware");
const {
  validateCreateCompanyMiddleware,
  validateUpdateSettingsMiddleware,
  validateUpdateStatusMiddleware
} = require("./company.validation");
const controller = require("./company.controller");

const router = express.Router();

/**
 * GET /api/v1/companies/me
 * Retrieves current authenticated user's company configuration.
 * Accessible to all authenticated employees, leads, and admins.
 */
router.get("/me", requireAuthenticatedUser, controller.getCurrentCompany);

/**
 * POST /api/v1/companies
 * Creates a new company tenant.
 * Restricted to Security Administrators / trusted backend onboarding.
 */
router.post(
  "/",
  requireAuthenticatedUser,
  requireSecurityAdmin,
  validateCreateCompanyMiddleware,
  controller.createCompany
);

/**
 * GET /api/v1/companies/:id
 * Retrieves company configuration by UUID.
 * Enforces company boundary.
 */
router.get("/:id", requireAuthenticatedUser, controller.getCompanyById);

/**
 * PATCH /api/v1/companies/:id/settings
 * Updates company settings (stale_after_minutes, default_grant_minutes, log_full_urls).
 * Restricted to Security Administrators.
 */
router.patch(
  "/:id/settings",
  requireAuthenticatedUser,
  requireSecurityAdmin,
  validateUpdateSettingsMiddleware,
  controller.updateSettings
);

/**
 * PATCH /api/v1/companies/:id/status
 * Activates or deactivates a company.
 * Restricted to Security Administrators.
 */
router.patch(
  "/:id/status",
  requireAuthenticatedUser,
  requireSecurityAdmin,
  validateUpdateStatusMiddleware,
  controller.updateStatus
);

/**
 * DELETE /api/v1/companies/:id
 * Rejects hard deletion; enforces soft deactivation via status.
 */
router.delete("/:id", controller.deleteCompany);

module.exports = router;
