
const express = require("express");

const {
  createUserSupabaseClient,
} = require("../config/supabase");

const {
  createPolicyService,
} = require("./policy.service");

const {
  createPolicyController,
} = require("./policy.controller");

const {
  validateCreatePolicy,
  validateUpdatePolicy,
  validatePagination,
} = require("./policy.validation");

/**
 * Creates routes for security policy management.
 *
 * All routes require authentication and Security Admin access.
 * Each request uses a user-scoped Supabase client.
 */
function createPolicyRoutes({
  authenticate,
  requireSecurityAdmin,
}) {
  if (typeof authenticate !== "function") {
    throw new Error(
      "Authentication middleware is required."
    );
  }

  if (typeof requireSecurityAdmin !== "function") {
    throw new Error(
      "Security admin middleware is required."
    );
  }

  const router = express.Router();

  // Initialize a request-scoped policy controller.
  function withPolicyController(action) {
    return (req, res, next) => {
      try {
        if (!req.accessToken) {
          return res.status(401).json({
            success: false,
            message: "Authentication token is required.",
          });
        }

        const supabase = createUserSupabaseClient(
          req.accessToken
        );

        const policyService = createPolicyService({
          supabase,
        });

        const policyController =
          createPolicyController(policyService);

        return policyController[action](
          req,
          res,
          next
        );
      } catch (error) {
        return next(error);
      }
    };
  }

  // All policy routes require authentication.
  router.use(authenticate);

  // List policies.
  router.get(
    "/",
    requireSecurityAdmin,
    validatePagination,
    withPolicyController("list")
  );

  // Get policy by ID.
  router.get(
    "/:id",
    requireSecurityAdmin,
    withPolicyController("getById")
  );

  // Create policy.
  router.post(
    "/",
    requireSecurityAdmin,
    validateCreatePolicy,
    withPolicyController("create")
  );

  // Update policy.
  router.patch(
    "/:id",
    requireSecurityAdmin,
    validateUpdatePolicy,
    withPolicyController("update")
  );

  return router;
}

module.exports = {
  createPolicyRoutes,
};
