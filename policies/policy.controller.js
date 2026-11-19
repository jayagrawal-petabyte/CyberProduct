
const logger = require("../config/logger");

const ALLOWED_EFFECTS = [
  "ALLOW",
  "BLOCK",
  "REQUIRES_APPROVAL",
];

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function createPolicyController(policyService) {
  if (!policyService) {
    throw new Error("Policy service is required.");
  }

  // Creates a consistent API error.
  function createError(message, statusCode) {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
  }

  // Identity and company information come only from authentication.
  function getUserContext(req) {
    const companyId = req.user?.company_id;
    const actorId = req.user?.id;

    if (!companyId || !actorId) {
      throw createError(
        "Authenticated user or company information is missing.",
        401
      );
    }

    return {
      companyId,
      actorId,
    };
  }

  // Validates policy ID from the URL.
  function validatePolicyId(policyId) {
    if (
      typeof policyId !== "string" ||
      !UUID_REGEX.test(policyId)
    ) {
      throw createError(
        "A valid policy UUID is required.",
        400
      );
    }
  }

  // Validates filters before querying the database.
  function validateListFilters(query = {}) {
    const filters = {};

    if (query.status !== undefined) {
      if (
        typeof query.status !== "string" ||
        query.status.trim().length === 0 ||
        query.status.length > 50
      ) {
        throw createError(
          "Invalid status filter.",
          400
        );
      }

      filters.status = query.status.trim();
    }

    if (query.effect !== undefined) {
      if (!ALLOWED_EFFECTS.includes(query.effect)) {
        throw createError(
          `Invalid effect filter. Allowed values: ${ALLOWED_EFFECTS.join(", ")}.`,
          400
        );
      }

      filters.effect = query.effect;
    }

    const uuidFilters = [
      "resource_id",
      "category_id",
    ];

    for (const field of uuidFilters) {
      if (query[field] !== undefined) {
        if (
          typeof query[field] !== "string" ||
          !UUID_REGEX.test(query[field])
        ) {
          throw createError(
            `${field} must be a valid UUID.`,
            400
          );
        }

        filters[field] = query[field];
      }
    }

    if (query.applies_to_role !== undefined) {
      if (
        typeof query.applies_to_role !== "string" ||
        query.applies_to_role.trim().length === 0 ||
        query.applies_to_role.length > 100
      ) {
        throw createError(
          "Invalid applies_to_role filter.",
          400
        );
      }

      filters.applies_to_role =
        query.applies_to_role.trim();
    }

    if (filters.resource_id && filters.category_id) {
      throw createError(
        "Filter by either resource_id or category_id, not both.",
        400
      );
    }

    return filters;
  }

  // Handles PostgreSQL errors and standard API responses.
  function handleError(res, error, context = {}) {
    let statusCode = error.statusCode || 500;

    if (error.code === "23505") {
      statusCode = 409;
    }

    if (
      ["23503", "23514", "22P02"].includes(error.code)
    ) {
      statusCode = 400;
    }

    if (statusCode >= 500) {
      logger.error("Policy management error.", {
        message: error.message,
        code: error.code,
        userId: context.actorId,
        companyId: context.companyId,
      });
    }

    const response = {
      success: false,
      message:
        statusCode >= 500
          ? "An internal server error occurred."
          : error.message,
    };

    if (Array.isArray(error.errors) && error.errors.length > 0) {
      response.errors = error.errors;
    }

    if (error.code && statusCode < 500) {
      response.code = error.code;
    }

    return res.status(statusCode).json(response);
  }

  // POST /api/v1/policies
  async function create(req, res) {
    let context = {};

    try {
      context = getUserContext(req);

      const result = await policyService.create({
        companyId: context.companyId,
        actorId: context.actorId,
        policyData: req.body,
      });

      return res.status(201).json({
        success: true,
        message: "Policy created successfully.",
        data: result.policy,
        companyPolicyVersion: result.companyPolicyVersion,
      });
    } catch (error) {
      return handleError(res, error, context);
    }
  }

  // GET /api/v1/policies
  async function list(req, res) {
    let context = {};

    try {
      context = getUserContext(req);

      const { page, limit } = req.pagination || {
        page: 1,
        limit: 20,
      };

      const filters = validateListFilters(req.query);

      const result = await policyService.list({
        companyId: context.companyId,
        page,
        limit,
        filters,
      });

      return res.status(200).json({
        success: true,
        message: "Policies retrieved successfully.",
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      return handleError(res, error, context);
    }
  }

  // GET /api/v1/policies/:id
  async function getById(req, res) {
    let context = {};

    try {
      context = getUserContext(req);

      const policyId = req.params.id;

      validatePolicyId(policyId);

      const policy = await policyService.getById({
        companyId: context.companyId,
        policyId,
      });

      if (!policy) {
        return res.status(404).json({
          success: false,
          message: "Policy not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Policy retrieved successfully.",
        data: policy,
      });
    } catch (error) {
      return handleError(res, error, context);
    }
  }

  // PATCH /api/v1/policies/:id
  async function update(req, res) {
    let context = {};

    try {
      context = getUserContext(req);

      const policyId = req.params.id;

      validatePolicyId(policyId);

      const result = await policyService.update({
        companyId: context.companyId,
        policyId,
        actorId: context.actorId,
        changes: req.body,
      });

      return res.status(200).json({
        success: true,
        message: "Policy updated successfully.",
        data: result.policy,
        companyPolicyVersion: result.companyPolicyVersion,
      });
    } catch (error) {
      return handleError(res, error, context);
    }
  }

  return {
    create,
    list,
    getById,
    update,
  };
}

module.exports = {
  createPolicyController,
};
