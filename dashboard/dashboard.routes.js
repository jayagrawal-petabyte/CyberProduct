
const express = require("express");

const {
  requireAuthenticatedUser,
  requireSecurityAdmin,
} = require("../auth/auth.middleware");

const {
  validateDashboardQuery,
} = require("./dashboard.validation");

const {
  getDashboardSummary,
} = require("./dashboard.controller");

const router = express.Router();

router.use(requireAuthenticatedUser);
router.use(requireSecurityAdmin);

// GET /api/v1/dashboard/summary
router.get(
  "/summary",
  validateDashboardQuery,
  getDashboardSummary
);

module.exports = router;
