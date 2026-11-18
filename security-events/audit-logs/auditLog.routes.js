
const express = require("express");

const {
  requireAuthenticatedUser,
  requireSecurityAdmin,
} = require("../../auth/auth.middleware");

const {
  validateAuditLogFilters,
} = require("./auditLog.validation");

const {
  listAuditLogs,
} = require("./auditLog.controller");

const router = express.Router();

// Every audit-log request requires authentication.
router.use(requireAuthenticatedUser);

// Only Security Admins can read audit logs.
router.use(requireSecurityAdmin);

// GET /api/v1/audit-logs
router.get(
  "/",
  validateAuditLogFilters,
  listAuditLogs
);

module.exports = router;
