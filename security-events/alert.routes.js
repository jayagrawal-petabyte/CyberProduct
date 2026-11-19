
const express = require("express");

const {
  requireAuthenticatedUser,
  requireSecurityAdmin,
} = require("../auth/auth.middleware");

const {
  validateAlertFilters,
} = require("./alert.validation");

const {
  listAlerts,
} = require("./alert.controller");

const router = express.Router();

router.use(requireAuthenticatedUser);
router.use(requireSecurityAdmin);

// GET /api/v1/alerts
router.get(
  "/",
  validateAlertFilters,
  listAlerts
);

module.exports = router;
