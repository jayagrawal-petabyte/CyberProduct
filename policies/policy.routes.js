
const express = require("express");

const {
  validateCreatePolicy,
  validateUpdatePolicy,
  validatePagination,
} = require("./policy.validation");

/**
 * Creates routes for security policy management.
 *
 * All policy routes require authentication.
 * Only security administrators can view, create, or update policies.
 *
 * @param {Object} dependencies
 * @param {Object} dependencies.policyController
 * @param {Function} dependencies.authenticate
 * @param {Function} dependencies.requireSecurityAdmin
 * @returns {import("express").Router}
 */
function createPolicyRoutes({
  policyController,
  authenticate,
  requireSecurityAdmin,
}) {
  if (!policyController) {
    throw new Error("Policy controller is required.");
  }

  if (typeof authenticate !== "function") {
    throw new Error("Authentication middleware is required.");
  }

  if (typeof requireSecurityAdmin !== "function") {
    throw new Error("Security admin middleware is required.");
  }

  const router = express.Router();

  // Every policy endpoint requires an authenticated user.
  router.use(authenticate);

  // List policies (security administrators only).
  router.get(
    "/",
    requireSecurityAdmin,
    validatePagination,
    policyController.list
  );

  // Get a policy by ID (security administrators only).
  router.get(
    "/:id",
    requireSecurityAdmin,
    policyController.getById
  );

  // Create a new policy.
  router.post(
    "/",
    requireSecurityAdmin,
    validateCreatePolicy,
    policyController.create
  );

  // Update an existing policy.
  router.patch(
    "/:id",
    requireSecurityAdmin,
    validateUpdatePolicy,
    policyController.update
  );

  return router;
}

module.exports = {
  createPolicyRoutes,
};
