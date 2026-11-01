
function requireAuthenticatedUser(req, res, next) {
  // The team's verified authentication middleware must populate
  // req.user and req.accessToken before this middleware runs.

  if (
    !req.user ||
    !req.user.id ||
    !req.user.company_id ||
    !req.accessToken
  ) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  next();
}

module.exports = { requireAuthenticatedUser };
