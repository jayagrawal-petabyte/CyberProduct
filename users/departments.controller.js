
const service = require("./departments.service");
const validation = require("./departments.validation");

const listDepartments = async (req, res) => {
  try {
    const data = await service.listDepartments(req.accessToken);

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("List departments error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to fetch departments"
    });
  }
};

const getDepartment = async (req, res) => {
  try {
    const data = await service.getDepartmentById(
      req.accessToken,
      req.params.id
    );

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Department not found"
      });
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Get department error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to fetch department"
    });
  }
};

const createDepartment = async (req, res) => {
  const errors = validation.validateDepartment(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  try {
    const data = await service.createDepartment(
      req.accessToken,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Department created successfully",
      data
    });
  } catch (error) {
    console.error("Create department error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to create department"
    });
  }
};

const editDepartment = async (req, res) => {
  const errors = validation.validateDepartmentUpdate(req.body);

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors
    });
  }

  try {
    const data = await service.updateDepartment(
      req.accessToken,
      req.params.id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Department updated successfully",
      data
    });
  } catch (error) {
    console.error("Update department error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to update department"
    });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const data = await service.deleteDepartment(
      req.accessToken,
      req.params.id
    );

    return res.status(200).json({
      success: true,
      message: "Department deleted successfully",
      data
    });
  } catch (error) {
    console.error("Delete department error:", error.message);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.statusCode
        ? error.message
        : "Failed to delete department"
    });
  }
};

module.exports = {
  listDepartments,
  getDepartment,
  createDepartment,
  editDepartment,
  deleteDepartment
};
