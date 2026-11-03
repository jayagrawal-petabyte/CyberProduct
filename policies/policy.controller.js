
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

  // Gets company and user information from authentication middleware.
  // Never accepts company_id from the request body or query parameters.
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

  // Validates list filters before querying the database.
  function validateListFilters(query) {
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

  // Handles errors and sends consistent responses.
  function handleError(res, error) {
    let statusCode = error.statusCode || 500;

    // PostgreSQL unique constraint violation.
    if (error.code === "23505") {
      statusCode = 409;
    }

    // PostgreSQL foreign key violation.
    if (error.code === "23503") {
      statusCode = 400;
    }

    // PostgreSQL check constraint violation.
    if (error.code === "23514") {
      statusCode = 400;
    }

    // PostgreSQL invalid text representation / enum value.
    if (error.code === "22P02") {
      statusCode = 400;
    }

    if (statusCode >= 500) {
      console.error(
        "Policy management error:",
        error
      );
    }

    return res.status(statusCode).json({
      success: false,
      message:
        statusCode >= 500
          ? "An internal server error occurred."
          : error.message,
    });
  }

  // POST /api/policies
  async function create(req, res) {
    try {
      const { companyId, actorId } =
        getUserContext(req);

      const result = await policyService.create({
        companyId,
        actorId,
        policyData: req.body,
      });

      return res.status(201).json({
        success: true,
        message: "Policy created successfully.",
        data: result.policy,
        companyPolicyVersion:
          result.companyPolicyVersion,
      });
    } catch (error) {
      return handleError(res, error);
    }
  }

  // GET /api/policies
  async function list(req, res) {
    try {
      const { companyId } =
        getUserContext(req);

      const { page, limit } = req.pagination || {
        page: 1,
        limit: 20,
      };

      const filters = validateListFilters(req.query);

      const result = await policyService.list({
        companyId,
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
      return handleError(res, error);
    }
  }

  // GET /api/policies/:id
  async function getById(req, res) {
    try {
      const { companyId } =
        getUserContext(req);

      const policyId = req.params.id;

      validatePolicyId(policyId);

      const policy = await policyService.getById({
        companyId,
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
      return handleError(res, error);
    }
  }

  // PATCH /api/policies/:id
  async function update(req, res) {
    try {
      const { companyId, actorId } =
        getUserContext(req);

      const policyId = req.params.id;

      validatePolicyId(policyId);

      const result = await policyService.update({
        companyId,
        policyId,
        actorId,
        changes: req.body,
      });

      return res.status(200).json({
        success: true,
        message: "Policy updated successfully.",
        data: result.policy,
        companyPolicyVersion:
          result.companyPolicyVersion,
      });
    } catch (error) {
      return handleError(res, error);
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
