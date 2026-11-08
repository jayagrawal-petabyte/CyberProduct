
const express = require("express");
const router = express.Router();

const controller = require("./registration.controller");

const {
  requireAuthenticatedUser
} = require("../../auth/auth.middleware");

router.use(requireAuthenticatedUser);

router.post("/", controller.registerDevice);

module.exports = router;
