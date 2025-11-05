const crypto = require("crypto");
const User = require("../models/User");
const { BadRequestError, UnauthenticatedError } = require("../errors");
const { createJWT } = require("../utils/jwt");
const sendVerificationEmail = require("../utils/sendVerificationEmail");
const hashString = require("../utils/createHash");

class AuthService {
  async register(userData) {
    const { email, name, password } = userData;

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

    return {
      msg: "Success! Please check your email to verify account",
    };
  }

  async verifyEmail(email, token) {
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

    return { msg: "Email verified!" };
  }

  async login(email, password) {
    if (!email || !password) {
      throw new BadRequestError("Please provide email and password");
    }

    const user = await User.findOne({ email });
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
      name: user.name,
      userId: user._id,
      roles: user.roles,
    };

    // Create refresh and access tokens
    const accessToken = createJWT({ payload: tokenUser });
    const refreshToken = await generateRefreshToken(user);

    return {
      user: tokenUser,
      accessToken,
      refreshToken,
    };
  }

  async forgotPassword(email) {
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
    user.passwordToken = hashString(passwordToken);
    user.passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
    await user.save();

    return {
      msg: "Please check your email for reset password link",
    };
  }

  async resetPassword(email, token, password) {
    if (!token || !email || !password) {
      throw new BadRequestError("Please provide all values");
    }

    const user = await User.findOne({ email });
    if (!user) {
      throw new BadRequestError("User not found");
    }

    const currentDate = new Date();
    if (
      user.passwordToken === hashString(token) &&
      user.passwordTokenExpirationDate > currentDate
    ) {
      user.password = password;
      user.passwordToken = null;
      user.passwordTokenExpirationDate = null;
      await user.save();
    } else {
      throw new BadRequestError("Invalid or expired reset token");
    }

    return { msg: "Password reset successful" };
  }

  async logout(userId) {
    // Clear refresh tokens
    await require("../models/RefreshToken").deleteMany({ user: userId });

    return { msg: "User logged out!" };
  }
}

module.exports = new AuthService();
