/**
 * Supabase JWT Handling and Verification Utilities
 * CyberProduct Backend Architecture - Pallavi
 *
 * Implements secure JWT extraction, payload inspection, signature verification,
 * and expiration checking.
 * Adheres to PRD Section 8 and Supabase Auth token specifications.
 */

const crypto = require("crypto");
const { AuthenticationError } = require("../config/errors");
const logger = require("../config/logger");

/**
 * Extracts the raw Bearer token from the incoming HTTP request Authorization header.
 *
 * @param {import("express").Request} req
 * @returns {string} The raw JWT string
 * @throws {AuthenticationError} If the header is missing, malformed, or empty
 */
function extractBearerToken(req) {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;

  if (!authHeader) {
    throw new AuthenticationError("Authentication token is required", "TOKEN_MISSING");
  }

  if (typeof authHeader !== "string") {
    throw new AuthenticationError("Invalid Authorization header format", "TOKEN_MALFORMED");
  }

  const parts = authHeader.trim().split(/\s+/);
  if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
    throw new AuthenticationError(
      "Authorization header must follow 'Bearer <token>' format",
      "TOKEN_MALFORMED"
    );
  }

  const token = parts[1].trim();
  if (!token) {
    throw new AuthenticationError("Authentication token is missing", "TOKEN_MISSING");
  }

  return token;
}

/**
 * Decodes a base64url encoded string safely into UTF-8 text.
 *
 * @param {string} str
 * @returns {string}
 */
function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf-8");
}

/**
 * Parses and inspects the payload of a JWT without verifying the signature.
 * Used for pre-validation (structure and expiration) before or alongside cryptographic verification.
 *
 * @param {string} token - The raw JWT string
 * @returns {{ header: Object, payload: Object, signature: string }}
 * @throws {AuthenticationError} If the token structure is malformed
 */
function decodeJwt(token) {
  if (typeof token !== "string") {
    throw new AuthenticationError("Token must be a string", "TOKEN_MALFORMED");
  }

  const segments = token.split(".");
  if (segments.length !== 3) {
    throw new AuthenticationError("Authentication token is malformed", "TOKEN_MALFORMED");
  }

  const [headerB64, payloadB64, signatureB64] = segments;

  let header;
  let payload;

  try {
    header = JSON.parse(base64UrlDecode(headerB64));
  } catch {
    throw new AuthenticationError("Invalid JWT header format", "TOKEN_MALFORMED");
  }

  if (!header || typeof header !== "object" || !header.alg || typeof header.alg !== "string") {
    throw new AuthenticationError("Invalid JWT header or missing algorithm", "TOKEN_MALFORMED");
  }

  if (header.alg.toLowerCase() === "none") {
    throw new AuthenticationError("Unsigned JWTs (alg: 'none') are strictly prohibited", "UNSUPPORTED_ALGORITHM");
  }

  try {
    payload = JSON.parse(base64UrlDecode(payloadB64));
  } catch {
    throw new AuthenticationError("Invalid JWT payload format", "TOKEN_MALFORMED");
  }

  if (!payload || typeof payload !== "object") {
    throw new AuthenticationError("Invalid JWT payload format", "TOKEN_MALFORMED");
  }

  return {
    header,
    payload,
    signature: signatureB64
  };
}

/**
 * Validates token expiration timestamp (`exp`).
 *
 * @param {Object} payload - The decoded JWT payload
 * @throws {AuthenticationError} If the token has expired
 */
function validateExpiration(payload) {
  if (payload.exp !== undefined) {
    const nowInSeconds = Math.floor(Date.now() / 1000);
    if (typeof payload.exp !== "number" || Number.isNaN(payload.exp) || payload.exp < nowInSeconds) {
      throw new AuthenticationError("Authentication token has expired", "TOKEN_EXPIRED");
    }
  }
}

/**
 * Verifies the cryptographic HMAC-SHA256 signature locally if a secret is provided.
 *
 * @param {string} token - The raw JWT
 * @param {string} secret - The HMAC secret (SUPABASE_JWT_SECRET)
 * @returns {boolean} True if the signature matches
 */
function verifyHmacSignature(token, secret) {
  if (typeof token !== "string" || typeof secret !== "string" || !secret) {
    return false;
  }

  const segments = token.split(".");
  if (segments.length !== 3) return false;

  const [headerB64, payloadB64, signatureB64] = segments;
  if (!signatureB64) return false;

  const data = `${headerB64}.${payloadB64}`;

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(data)
    .digest("base64url");

  const sigBuf = Buffer.from(signatureB64);
  const expBuf = Buffer.from(expectedSignature);

  // timingSafeEqual throws RangeError if buffer lengths differ
  if (sigBuf.length !== expBuf.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuf, expBuf);
}

/**
 * Verifies a Supabase JWT token either via the authoritative Supabase Auth API
 * or via local signature checking when configured.
 *
 * @param {string} token - Raw JWT
 * @param {Object} [serviceSupabaseClient] - Client initialized with SUPABASE_SERVICE_ROLE_KEY
 * @param {string} [jwtSecret] - Optional local JWT secret
 * @returns {Promise<{ id: string, email: string, [key: string]: any }>} The verified auth user
 * @throws {AuthenticationError}
 */
async function verifySupabaseToken(token, serviceSupabaseClient = null, jwtSecret = null) {
  // 1. Structure check & pre-verification
  const { header, payload } = decodeJwt(token);

  // 2. Validate expiration claim
  validateExpiration(payload);

  // 3. Cryptographic signature verification when local secret is available
  if (jwtSecret) {
    if (header.alg !== "HS256") {
      throw new AuthenticationError(`Unsupported algorithm: ${header.alg}`, "UNSUPPORTED_ALGORITHM");
    }

    const isValidSig = verifyHmacSignature(token, jwtSecret);
    if (!isValidSig) {
      logger.warn("JWT HMAC signature verification failed");
      throw new AuthenticationError("Invalid token signature", "INVALID_SIGNATURE");
    }
  }

  // 4. Verify authoritative Supabase Auth status when service client is provided
  if (serviceSupabaseClient?.auth?.getUser) {
    const { data, error } = await serviceSupabaseClient.auth.getUser(token);

    if (error || !data?.user) {
      const errorMessage = error?.message || "Invalid or unverified authentication token";
      logger.warn(`Supabase token verification rejected: ${errorMessage}`);

      if (error?.message?.toLowerCase().includes("expired")) {
        throw new AuthenticationError("Authentication token has expired", "TOKEN_EXPIRED");
      }

      throw new AuthenticationError("Invalid authentication token", "TOKEN_INVALID");
    }

    return data.user;
  }

  // 5. If no auth.getUser service is available, return verified payload claims if HMAC succeeded
  if (jwtSecret && payload.sub) {
    return {
      id: payload.sub,
      email: payload.email || null,
      app_metadata: payload.app_metadata || {},
      user_metadata: payload.user_metadata || {}
    };
  }

  throw new Error("Supabase service client is required for token verification");
}

module.exports = {
  extractBearerToken,
  decodeJwt,
  validateExpiration,
  verifyHmacSignature,
  verifySupabaseToken
};
