
const express = require("express");
const router = express.Router();

const controller = require("./users.controller");

const {
  requireAuthenticatedUser
} = require("../auth/auth.middleware");

router.use(requireAuthenticatedUser);

router.get("/", controller.listProfiles);
router.get("/:id", controller.getProfile);
router.patch("/:id", controller.editProfile);

module.exports = router;
