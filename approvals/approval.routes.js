
const express = require("express");

const {
  requireAuthenticatedUser
} = require("../auth/auth.middleware");

const {
  approveAccessRequest,
  rejectAccessRequest
} = require("./approval.controller");

const router = express.Router();

router.patch(
  "/:requestId/approve",
  requireAuthenticatedUser,
  approveAccessRequest
);

router.patch(
  "/:requestId/reject",
  requireAuthenticatedUser,
  rejectAccessRequest
);

module.exports = router;
