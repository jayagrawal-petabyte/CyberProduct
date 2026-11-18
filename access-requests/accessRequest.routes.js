
const express = require("express");

const {
  requireAuthenticatedUser
} = require("../auth/auth.middleware");

const {
  validateCreateAccessRequest
} = require("./accessRequest.validation");

const {
  submitAccessRequest
} = require("./accessRequest.controller");

const router = express.Router();

router.post(
  "/",
  requireAuthenticatedUser,
  validateCreateAccessRequest,
  submitAccessRequest
);

module.exports = router;
