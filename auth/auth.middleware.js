/**
 * Authentication and Session Verification Middleware
 * CyberProduct Backend Architecture - Pallavi
 *
 * Verifies Supabase JWT tokens, resolves trusted user profiles from the database,
 * checks tenant (company) active state, and populates the authenticated request context.
 *
 * Implements strict tenant isolation, zero trust of client-supplied identity,
 * and comprehensive error handling.
 */

const { createServiceSupabaseClient } = require("../config/supabase");
const { config } = require("../config/env");
const logger = require("../config/logger");
const { AuthenticationError, ForbiddenError } = require("../config/errors");
const {
  extractBearerToken,
  decodeJwt,
  validateExpiration,
  verifySupabaseToken
} = require("./jwt");
const {
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
} = require("./rbac");

/**
 * Express middleware that authenticates the caller via Supabase JWT.
 * Populates req.user, req.company, and req.accessToken upon successful verification.
 *
 * Preserves backward compatibility: if req.user and req.accessToken are already
 * populated by upstream test fixtures, it validates their presence and proceeds.
 *
 * @param {import("express").Request} req
 * @param {import("express").Response} res
 * @param {import("express").NextFunction} next
 */
async function requireAuthenticatedUser(req, res, next) {
  try {
    // 1. Isolated test support: Production requests must NEVER skip authentication
    // simply because request properties were pre-populated.
    const isProduction = process.env.NODE_ENV === "production" || config.server?.isProduction;
    const isTest = process.env.NODE_ENV === "test";

    if (!isProduction && isTest) {
      const isEnforcingAuth = req.headers?.["x-enforce-auth"] === "true" || req.headers?.["x-test-enforce-auth"] === "true";
      if (!isEnforcingAuth && req.user && req.user.id && req.user.company_id && req.accessToken) {
        return next();
      }
    }

    // 2. Extract Bearer token from Authorization header
    let token;
    try {
      token = extractBearerToken(req);
    } catch (tokenErr) {
      return res.status(tokenErr.statusCode || 401).json({
        success: false,
        message: tokenErr.message || "Authentication required",
        code: tokenErr.code || "TOKEN_REQUIRED"
      });
    }

    // 3. Fast pre-flight check of token format and expiration
    try {
      const decoded = decodeJwt(token);
      validateExpiration(decoded.payload);
    } catch (jwtErr) {
      return res.status(jwtErr.statusCode || 401).json({
        success: false,
        message: jwtErr.message,
        code: jwtErr.code || "TOKEN_INVALID"
      });
    }

    // 4. Verify token cryptographic validity and user existence via Supabase Auth
    let authUser;
    let serviceClient;

    try {
      serviceClient = createServiceSupabaseClient();
      authUser = await verifySupabaseToken(
        token,
        serviceClient,
        config.supabase.jwtSecret
      );
    } catch (verifyErr) {
      return res.status(verifyErr.statusCode || 401).json({
        success: false,
        message: verifyErr.message || "Invalid or unverified authentication token",
        code: verifyErr.code || "TOKEN_INVALID"
      });
    }

    if (!authUser || !authUser.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid authentication credentials",
        code: "AUTH_USER_NOT_FOUND"
      });
    }

    // 5. Resolve active database profile (source of truth for role, company, and status)
    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select(
        "id, company_id, employee_code, full_name, email, role, department_id, manager_id, job_title, status"
      )
      .eq("id", authUser.id)
      .maybeSingle();

    if (profileError) {
      logger.error("Failed to query user profile:", profileError.message);
      return res.status(500).json({
        success: false,
        message: "Unable to verify user profile"
      });
    }

    if (!profile) {
      logger.warn(`Authentication denied: No database profile found for auth user '${authUser.id}'`);
      return res.status(401).json({
        success: false,
        message: "Active user profile not found",
        code: "PROFILE_NOT_FOUND"
      });
    }

    // 6. Verify profile status (suspended or deactivated users are locked out)
    if (profile.status !== "active") {
      logger.warn(`Authentication denied: User '${profile.id}' account status is '${profile.status}'`);
      return res.status(403).json({
        success: false,
        message: `User account is ${profile.status}`,
        code: "ACCOUNT_INACTIVE"
      });
    }

    // 7. Verify role validity before trusting profile
    if (!isValidRole(profile.role)) {
      logger.warn(`Authentication denied: User '${profile.id}' has invalid role '${profile.role}'`);
      return res.status(403).json({
        success: false,
        message: "User account has an invalid or unrecognized role",
        code: "INVALID_ROLE"
      });
    }

    // 8. Verify profile has an associated company
    if (!profile.company_id) {
      logger.warn(`Authentication denied: User '${profile.id}' has no associated company`);
      return res.status(403).json({
        success: false,
        message: "User profile has no associated company tenant",
        code: "MISSING_TENANT_CONTEXT"
      });
    }

    // 9. Resolve company and verify tenant is active
    const { data: company, error: companyError } = await serviceClient
      .from("companies")
      .select("id, name, slug, status, settings, policy_version")
      .eq("id", profile.company_id)
      .maybeSingle();

    if (companyError) {
      logger.error("Failed to query company details:", companyError.message);
      return res.status(500).json({
        success: false,
        message: "Unable to verify company account"
      });
    }

    if (!company || company.status !== "active") {
      logger.warn(`Authentication denied: Company '${profile.company_id}' is inactive or not found`);
      return res.status(403).json({
        success: false,
        message: "Company account is inactive or disabled",
        code: "COMPANY_INACTIVE"
      });
    }

    // 8. Populate trusted request context
    req.user = {
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      role: profile.role,
      company_id: profile.company_id,
      department_id: profile.department_id,
      manager_id: profile.manager_id,
      job_title: profile.job_title,
      status: profile.status
    };

    req.company = {
      id: company.id,
      name: company.name,
      slug: company.slug,
      status: company.status,
      settings: company.settings || {},
      policy_version: company.policy_version
    };

    req.accessToken = token;

    next();
  } catch (error) {
    logger.error("Authentication middleware unexpected error:", error);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during authentication"
    });
  }
}

// Alias for modules expecting `authenticate`
const authenticate = requireAuthenticatedUser;

module.exports = {
  requireAuthenticatedUser,
  authenticate,
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
