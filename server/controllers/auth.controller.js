const crypto = require("crypto");
const User = require("../models/User");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const { createJWT, attachCookiesToResponse } = require("../utils/jwt");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const sendResetPasswordEmail = require("../utils/sendResetPasswordEmail");
const createHash = require("../utils/createHash");

const register = async (req, res) => {
  const { username, email, password } = req.body;

  // Check if email already exists
  const emailExists = await User.findOne({ email });
  if (emailExists) {
    throw new BadRequestError("Email already exists");
  }

  // First registered user is an admin
  const isFirstAccount = (await User.countDocuments({})) === 0;

  // Create verification token
  const verificationToken = crypto.randomBytes(40).toString("hex");

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    verificationToken,
    roles: [], // Will be set after email verification
  });

  // Generate verification URL
  const origin = process.env.FRONTEND_URL || "http://localhost:5173";

  // Send verification email
  await sendVerificationEmail({
    name: user.name,
    email: user.email,
    verificationToken,
    origin,
  });

  res.status(201).json({
    success: true,
    message: "Success! Please check your email to verify account",
  });
};

const verifyEmail = async (req, res) => {
  const { email, token } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    throw new UnauthenticatedError("Verification failed");
  }

  if (user.verificationToken !== token) {
    throw new UnauthenticatedError("Verification failed");
  }

  // Set default role after verification
  const Role = require("../models/Role");
  const defaultRole = await Role.findOne({ name: "student" });

  user.isVerified = true;
  user.verified = Date.now();
  user.verificationToken = "";
  user.roles = [defaultRole._id];

  await user.save();

  res.status(200).json({
    success: true,
    message: "Email verified!",
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new BadRequestError("Please provide email and password");
  }

  const user = await User.findOne({ email }).populate({
    path: "roles",
    select: "name permissions level -_id",
  });

  if (!user) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError("Invalid credentials");
  }

  if (!user.isVerified) {
    throw new UnauthenticatedError("Please verify your email");
  }

  if (user.status !== "active") {
    throw new UnauthenticatedError("Your account is not active");
  }

  // Create token user
  const tokenUser = {
    username: user.username,
    userId: user._id,
    roles: user.roles,
  };

  // TODO: Create this method
  await sendTokenResponse({
    res,
    user: tokenUser,
    statusCode: 200,
  });
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("User not found");
  }

  // Generate password reset token
  const passwordToken = crypto.randomBytes(70).toString("hex");
  const origin = process.env.FRONTEND_URL || "http://localhost:5173";

  // Send reset password email
  await sendResetPasswordEmail({
    name: user.name,
    email: user.email,
    token: passwordToken,
    origin,
  });

  // Hash token before saving and set expiration
  const tenMinutes = 1000 * 60 * 10;
  user.passwordToken = createHash(passwordToken);
  user.passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
  await user.save();

  res.status(200).json({
    success: true,
    message: "Please check your email for reset password link",
  });
};

const resetPassword = async (req, res) => {
  const { email, token, password } = req.body;

  if (!token || !email || !password) {
    throw new BadRequestError("Please provide all values");
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new BadRequestError("User not found");
  }

  const currentDate = new Date();
  if (
    user.passwordToken === createHash(token) &&
    user.passwordTokenExpirationDate > currentDate
  ) {
    user.password = password;
    user.passwordToken = null;
    user.passwordTokenExpirationDate = null;
    await user.save();
  } else {
    throw new BadRequestError("Invalid or expired reset token");
  }

  res.status(200).json({
    success: true,
    message: "Password reset successful",
  });
};

const logout = async (req, res) => {
  // Remove refresh token
  await require("../models/RefreshToken").findOneAndDelete({
    user: req.user.userId,
  });

  // Clear cookies
  res.cookie("accessToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });
  res.cookie("refreshToken", "logout", {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(200).json({
    success: true,
    message: "User logged out!",
  });
};

const getCurrentUser = async (req, res) => {
  const user = await User.findOne({ _id: req.user.userId })
    .populate({
      path: "roles",
      select: "name permissions level -_id",
    })
    .select("-password");

  res.status(200).json({ user });
};

module.exports = {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
};
