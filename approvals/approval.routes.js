const express = require("express");

const {
  requireAuthenticatedUser,
  requireLeadOrAdmin
} = require("../auth/auth.middleware");

const {
  approveAccessRequest,
  rejectAccessRequest
} = require("./approval.controller");

const router = express.Router();

router.patch(
  "/:requestId/approve",
  requireAuthenticatedUser,
  requireLeadOrAdmin,
  approveAccessRequest
);

router.patch(
  "/:requestId/reject",
  requireAuthenticatedUser,
  requireLeadOrAdmin,
  rejectAccessRequest
);

module.exports = router;