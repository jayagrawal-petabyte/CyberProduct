
const {
  validateCreateResource,
  validateUpdateResource,
  validateResourceFilters,
} = require("./resource.validation");

function createResourceController({
  createUserSupabaseClient,
  createResourceService,
}) {
  if (
    typeof createUserSupabaseClient !== "function" ||
    typeof createResourceService !== "function"
  ) {
    throw new Error(
      "Supabase client and resource service factories are required."
    );
  }

  // Build a service using the authenticated user's token.
  function getResourceService(req) {
    if (!req.accessToken) {
      const error = new Error("Authentication token is missing.");
      error.statusCode = 401;
      throw error;
    }

    const supabase = createUserSupabaseClient(req.accessToken);
    return createResourceService(supabase);
  }

  // Get tenant information from the authenticated user.
  function getUserContext(req) {
    const companyId = req.user?.company_id;
    const userId = req.user?.id;

    if (!companyId) {
      return {
        error: "Authenticated company information is missing.",
      };
    }

    return { companyId, userId };
  }

  function handleDatabaseError(error, res, action) {
    console.error(`${action} resource error:`, error);

    if (error.statusCode === 401) {
      return res.status(401).json({
        success: false,
        message: error.message,
      });
    }

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message:
          "A resource with this type and identifier already exists.",
      });
    }

    if (error.code === "23503") {
      return res.status(400).json({
        success: false,
        message:
          "A referenced record does not exist or is invalid.",
      });
    }

    return res.status(error.statusCode || 500).json({
      success: false,
      message:
        error.statusCode && error.statusCode < 500
          ? error.message
          : `Failed to ${action.toLowerCase()} resource.`,
    });
  }

  async function list(req, res) {
    try {
      const context = getUserContext(req);

      if (context.error) {
        return res.status(401).json({
          success: false,
          message: context.error,
        });
      }

      const { errors, pagination } =
        validateResourceFilters(req.query);

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid resource filters.",
          errors,
        });
      }

      const resourceService = getResourceService(req);

      const result = await resourceService.list({
        companyId: context.companyId,
        page: pagination.page,
        limit: pagination.limit,
        filters: req.query,
      });

      return res.status(200).json({
        success: true,
        message: "Resources retrieved successfully.",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return handleDatabaseError(error, res, "Retrieve");
    }
  }

  async function getById(req, res) {
    try {
      const context = getUserContext(req);

      if (context.error) {
        return res.status(401).json({
          success: false,
          message: context.error,
        });
      }

      const resourceService = getResourceService(req);

      const resource = await resourceService.getById({
        companyId: context.companyId,
        resourceId: req.params.id,
      });

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Resource retrieved successfully.",
        data: resource,
      });
    } catch (error) {
      return handleDatabaseError(error, res, "Retrieve");
    }
  }

  async function create(req, res) {
    try {
      const context = getUserContext(req);

      if (context.error) {
        return res.status(401).json({
          success: false,
          message: context.error,
        });
      }

      const errors = validateCreateResource(req.body);

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid resource data.",
          errors,
        });
      }

      const resourceService = getResourceService(req);

      const resource = await resourceService.create({
        ...req.body,
        companyId: context.companyId,
        createdBy: context.userId,
      });

      return res.status(201).json({
        success: true,
        message: "Resource created successfully.",
        data: resource,
      });
    } catch (error) {
      return handleDatabaseError(error, res, "Create");
    }
  }

  async function update(req, res) {
    try {
      const context = getUserContext(req);

      if (context.error) {
        return res.status(401).json({
          success: false,
          message: context.error,
        });
      }

      const errors = validateUpdateResource(req.body);

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Invalid resource data.",
          errors,
        });
      }

      const resourceService = getResourceService(req);

      const resource = await resourceService.update({
        companyId: context.companyId,
        resourceId: req.params.id,
        changes: req.body,
      });

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: "Resource not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Resource updated successfully.",
        data: resource,
      });
    } catch (error) {
      return handleDatabaseError(error, res, "Update");
    }
  }

  return {
    list,
    getById,
    create,
    update,
  };
}

module.exports = { createResourceController };