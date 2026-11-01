
const express = require("express");

function createResourceRoutes({
  resourceController,
  authenticate,
  requireSecurityAdmin,
}) {
  const router = express.Router();

  // All resource endpoints require authentication.
  router.use(authenticate);

  // Read operations.
  router.get("/", resourceController.list);
  router.get("/:id", resourceController.getById);

  // Write operations require security administrator access.
  router.post(
    "/",
    requireSecurityAdmin,
    resourceController.create
  );

  router.patch(
    "/:id",
    requireSecurityAdmin,
    resourceController.update
  );

  return router;
}

module.exports = { createResourceRoutes };
