const jwt = require("jsonwebtoken");
const RefreshToken = require("../models/RefreshToken");

const createAccessToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "15m" });
};

const createRefreshToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "30d",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET);
};

const sendTokenResponse = async ({ res, user, statusCode = 200 }) => {
  // Create tokens
  const accessToken = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  // Store refresh token in database
  await RefreshToken.create({
    user: user.userId,
    token: refreshToken,
    expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
  });

  // Send response
  return res.status(statusCode).json({
    success: true,
    user,
    accessToken,
    refreshToken,
  });
};

// After verifying refresh token
// await RefreshToken.deleteOne({ token: refreshToken });
// const newRefreshToken = await generateRefreshToken(user);
