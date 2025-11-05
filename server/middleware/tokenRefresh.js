const {
  verifyAccessToken,
  verifyRefreshToken,
  createAccessToken,
} = require("../utils/jwt");
const { UnauthenticatedError } = require("../errors");
const RefreshToken = require("../models/RefreshToken");

const tokenRefreshMiddleware = async (req, res, next) => {
  try {
    // Get the access token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthenticatedError("Authentication invalid");
    }
    const accessToken = authHeader.split(" ")[1];

    try {
      // Try to verify access token
      const payload = verifyAccessToken(accessToken);
      req.user = payload;
      return next();
    } catch (error) {
      // Access token is expired, try to use refresh token
      const refreshToken = req.headers["x-refresh-token"];
      if (!refreshToken) {
        throw new UnauthenticatedError("Refresh token missing");
      }

      // Verify refresh token
      const decoded = verifyRefreshToken(refreshToken);

      // Check if refresh token exists in database and is valid
      const storedToken = await RefreshToken.findOne({
        token: refreshToken,
        user: decoded.userId,
        expiresAt: { $gt: new Date() },
      });

      if (!storedToken) {
        throw new UnauthenticatedError("Refresh token invalid or expired");
      }

      // Create new access token
      const user = {
        userId: decoded.userId,
        username: decoded.username,
        roles: decoded.roles,
      };
      const newAccessToken = createAccessToken(user);

      // Attach new token to response headers
      res.set("Access-Control-Expose-Headers", "x-new-access-token");
      res.set("x-new-access-token", newAccessToken);

      // Continue with request
      req.user = user;
      next();
    }
  } catch (error) {
    throw new UnauthenticatedError("Authentication invalid");
  }
};

module.exports = tokenRefreshMiddleware;
