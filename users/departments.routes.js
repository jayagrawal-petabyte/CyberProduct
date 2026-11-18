
const express = require("express");
const router = express.Router();

const controller = require("./departments.controller");

const {
  requireAuthenticatedUser
} = require("../auth/auth.middleware");

router.use(requireAuthenticatedUser);

router.get("/", controller.listDepartments);
router.get("/:id", controller.getDepartment);
router.post("/", controller.createDepartment);
router.patch("/:id", controller.editDepartment);
router.delete("/:id", controller.deleteDepartment);

module.exports = router;
