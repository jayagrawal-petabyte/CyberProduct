
const {
  validateCreateCategory,
  validateUpdateCategory,
  validatePagination,
} = require("./category.validation");

function createCategoryController(service) {
  function sendError(res, status, message) {
    return res.status(status).json({
      success: false,
      error: { message },
    });
  }

  function handleError(res, error) {
    if (error.code === "23505") {
      return sendError(
        res,
        409,
        "A category with this name already exists."
      );
    }

    if (error.code === "23503") {
      return sendError(
        res,
        400,
        "The request references an invalid record."
      );
    }

    return sendError(res, 500, "An unexpected error occurred.");
  }

  function getCompanyId(req) {
    return req.user?.company_id;
  }

  async function list(req, res) {
    const pagination = validatePagination(req.query);

    if (pagination.error) {
      return sendError(res, 400, pagination.error);
    }

    const companyId = getCompanyId(req);

    if (!companyId) {
      return sendError(res, 401, "Authenticated company context is required.");
    }

    try {
      const result = await service.list({
        companyId,
        ...pagination,
      });

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async function getById(req, res) {
    const companyId = getCompanyId(req);

    if (!companyId) {
      return sendError(res, 401, "Authenticated company context is required.");
    }

    try {
      const category = await service.getById({
        companyId,
        categoryId: req.params.categoryId,
      });

      if (!category) {
        return sendError(res, 404, "Category not found.");
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async function create(req, res) {
    const errors = validateCreateCategory(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed.",
          details: errors,
        },
      });
    }

    const companyId = getCompanyId(req);

    if (!companyId) {
      return sendError(res, 401, "Authenticated company context is required.");
    }

    try {
      const category = await service.create({
        companyId,
        name: req.body.name,
        description: req.body.description,
      });

      return res.status(201).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  async function update(req, res) {
    const errors = validateUpdateCategory(req.body);

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: "Validation failed.",
          details: errors,
        },
      });
    }

    const companyId = getCompanyId(req);

    if (!companyId) {
      return sendError(res, 401, "Authenticated company context is required.");
    }

    try {
      const category = await service.update({
        companyId,
        categoryId: req.params.categoryId,
        changes: req.body,
      });

      if (!category) {
        return sendError(res, 404, "Category not found.");
      }

      return res.status(200).json({
        success: true,
        data: category,
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  return {
    list,
    getById,
    create,
    update,
  };
}

module.exports = { createCategoryController };
