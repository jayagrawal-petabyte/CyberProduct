
const express = require("express");

const {
  createCategoryService,
} = require("./category.service");

const {
  createCategoryController,
} = require("./category.controller");

function createCategoryRouter({
  supabase,
  authenticate,
  requireSecurityAdmin,
}) {
  if (!supabase || !authenticate || !requireSecurityAdmin) {
    throw new Error("Category router dependencies are required.");
  }

  const router = express.Router();

  const service = createCategoryService(supabase);
  const controller = createCategoryController(service);

  router.use(authenticate);

  router.get("/", controller.list);
  router.get("/:categoryId", controller.getById);

  router.post(
    "/",
    requireSecurityAdmin,
    controller.create
  );

  router.patch(
    "/:categoryId",
    requireSecurityAdmin,
    controller.update
  );

  return router;
}

module.exports = { createCategoryRouter };
