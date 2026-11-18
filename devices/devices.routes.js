
const express = require("express");
const router = express.Router();

const controller = require("./devices.controller");

const {
  requireAuthenticatedUser
} = require("../auth/auth.middleware");

router.use(requireAuthenticatedUser);

router.get("/", controller.listDevices);
router.get("/:id", controller.getDevice);
router.patch("/:id", controller.editDevice);
router.patch("/:id/revoke", controller.revokeDevice);

module.exports = router;
