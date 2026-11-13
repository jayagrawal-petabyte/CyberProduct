/**
 * Role-Based Access Control (RBAC) & Tenant Authorization Middleware
 * CyberProduct Backend Architecture - Pallavi
 *
 * Implements role checks and tenant isolation matching the PostgreSQL RLS matrix.
 * Supported roles: employee, lead, security_admin.
 * Enforces least-privilege access and tenant separation.
 */

const { ForbiddenError, AuthenticationError } = require("../config/errors");
const logger = require("../config/logger");

/**
 * Valid application roles defined in PostgreSQL enum `public.app_role`.
 */
const ROLES = Object.freeze({
  EMPLOYEE: "employee",
  LEAD: "lead",
  SECURITY_ADMIN: "security_admin"
});

const VALID_ROLES = new Set(Object.values(ROLES));

/**
 * Verifies if a role string is a recognized system role.
 *
 * @param {string} role
 * @returns {boolean}
 */
function isValidRole(role) {
  return typeof role === "string" && VALID_ROLES.has(role);
}

/**
 * Factory creating middleware that restricts access to users possessing one of the allowed roles.
 *
 * @param {...string} allowedRoles - One or more authorized app_role values
 * @returns {import("express").RequestHandler}
 */
function requireRole(...allowedRoles) {
  const flattenedRoles = allowedRoles.flat();

  // Validate configuration during startup
  for (const role of flattenedRoles) {
    if (!isValidRole(role)) {
      throw new Error(`Invalid role configured for RBAC middleware: '${role}'`);
    }
  }

  return function rbacMiddleware(req, res, next) {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        message: "Authentication required before role evaluation",
        code: "AUTHENTICATION_REQUIRED"
      });
    }

    const userRole = req.user.role;

    if (!flattenedRoles.includes(userRole)) {
      logger.warn(`Access forbidden: User '${req.user.id}' with role '${userRole}' attempted access requiring [${flattenedRoles.join(", ")}]`);

      return res.status(403).json({
        success: false,
        message: `Forbidden: role '${userRole}' is not authorized to access this resource`,
        code: "FORBIDDEN_ROLE"
      });
    }

    next();
  };
}

/**
 * Convenience middleware for routes restricted solely to Security Administrators.
 */
const requireSecurityAdmin = requireRole(ROLES.SECURITY_ADMIN);

/**
 * Convenience middleware for routes restricted to Leads/Managers.
 */
const requireLead = requireRole(ROLES.LEAD);

/**
 * Convenience middleware for routes accessible by either Leads or Security Admins.
 */
const requireLeadOrAdmin = requireRole(ROLES.LEAD, ROLES.SECURITY_ADMIN);

/**
 * Convenience middleware ensuring the caller has any valid company role.
 */
const requireEmployee = requireRole(ROLES.EMPLOYEE, ROLES.LEAD, ROLES.SECURITY_ADMIN);

/**
 * Middleware enforcing tenant isolation: verifies that a resource's target company ID
 * exactly matches the authenticated user's company context.
 *
 * @param {(req: import("express").Request) => string|null|undefined} getTargetCompanyId - Resolver function
 * @returns {import("express").RequestHandler}
 */
function requireSameCompany(getTargetCompanyId) {
  return function tenantIsolationMiddleware(req, res, next) {
    if (!req.user || !req.user.company_id) {
      return res.status(401).json({
        success: false,
        message: "User tenant context is missing",
        code: "MISSING_TENANT_CONTEXT"
      });
    }

    const targetCompanyId = getTargetCompanyId(req);

    if (!targetCompanyId) {
      return res.status(400).json({
        success: false,
        message: "Target company identifier is required",
        code: "INVALID_TENANT_TARGET"
      });
    }

    if (targetCompanyId !== req.user.company_id) {
      logger.warn(`Tenant isolation violation attempt: User '${req.user.id}' (Company '${req.user.company_id}') tried accessing Company '${targetCompanyId}'`);

      return res.status(403).json({
        success: false,
        message: "Cross-tenant access is strictly prohibited",
        code: "CROSS_TENANT_FORBIDDEN"
      });
    }

    next();
  };
}

/**
 * Middleware enforcing object ownership: verifies that the target record is owned
 * by the caller, unless the caller is a Security Administrator.
 *
 * @param {(req: import("express").Request) => string|null|undefined} getOwnerId - Resolver function
 * @returns {import("express").RequestHandler}
 */
function requireOwnRecordOrAdmin(getOwnerId) {
  return function ownershipMiddleware(req, res, next) {
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: "User context is required",
        code: "AUTHENTICATION_REQUIRED"
      });
    }

    // Security admins can access records within their company; tenant context is strictly required
    if (req.user.role === ROLES.SECURITY_ADMIN) {
      if (!req.user.company_id) {
        logger.warn(`Admin access denied: Security administrator '${req.user.id}' is missing company context`);
        return res.status(403).json({
          success: false,
          message: "User tenant context is missing",
          code: "MISSING_TENANT_CONTEXT"
        });
      }
      return next();
    }

    if (typeof getOwnerId !== "function") {
      logger.error("Ownership check misconfigured: getOwnerId resolver function is missing");
      return res.status(500).json({
        success: false,
        message: "Record owner resolver is not configured"
      });
    }

    const recordOwnerId = getOwnerId(req);

    // Fail closed: Missing or empty owner ID must never be treated as granted permission
    if (!recordOwnerId || typeof recordOwnerId !== "string" || recordOwnerId.trim() === "") {
      logger.warn(`Ownership check failed: Missing or invalid record owner identifier from user '${req.user.id}'`);
      return res.status(400).json({
        success: false,
        message: "Record owner identifier is required",
        code: "INVALID_RECORD_OWNER"
      });
    }

    if (recordOwnerId !== req.user.id) {
      logger.warn(`Ownership violation attempt: User '${req.user.id}' tried accessing resource owned by '${recordOwnerId}'`);

      return res.status(403).json({
        success: false,
        message: "You can only view or modify your own records",
        code: "FORBIDDEN_OWNERSHIP"
      });
    }

    next();
  };
}

module.exports = {
  ROLES,
  VALID_ROLES,
  isValidRole,
  requireRole,
  requireSecurityAdmin,
  requireLead,
  requireLeadOrAdmin,
  requireEmployee,
  requireSameCompany,
  requireOwnRecordOrAdmin
};
