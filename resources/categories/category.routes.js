
const express = require("express");

const {
  createCategoryService,
} = require("./category.service");

const {
  createCategoryController,
} = require("./category.controller");

/**
 * Creates category routes using a request-scoped Supabase client.
 *
 * @param {Object} dependencies
 * @param {Function} dependencies.createUserSupabaseClient
 * @param {Function} dependencies.authenticate
 * @param {Function} dependencies.requireSecurityAdmin
 */
function createCategoryRouter({
  createUserSupabaseClient,
  authenticate,
  requireSecurityAdmin,
}) {
  if (typeof createUserSupabaseClient !== "function") {
    throw new Error(
      "createUserSupabaseClient is required."
    );
  }

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

  // Create a controller using the authenticated user's Supabase client.
  function withCategoryController(action) {
    return (req, res, next) => {
      try {
        if (!req.accessToken) {
          return res.status(401).json({
            success: false,
            error: {
              message: "Authentication token is required.",
            },
          });
        }

        const supabase = createUserSupabaseClient(
          req.accessToken
        );

        const service = createCategoryService(supabase);
        const controller = createCategoryController(service);

        return controller[action](req, res, next);
      } catch (error) {
        return next(error);
      }
    };
  }

  // All category endpoints require authentication.
  router.use(authenticate);

  // Read operations.
  router.get(
    "/",
    withCategoryController("list")
  );

  router.get(
    "/:categoryId",
    withCategoryController("getById")
  );

  // Write operations require Security Admin access.
  router.post(
    "/",
    requireSecurityAdmin,
    withCategoryController("create")
  );

  router.patch(
    "/:categoryId",
    requireSecurityAdmin,
    withCategoryController("update")
  );

  return router;
}

module.exports = {
  createCategoryRouter,
};
