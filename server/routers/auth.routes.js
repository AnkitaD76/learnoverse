const express = require("express");
const router = express.Router();

const {
  register,
  verifyEmail,
  login,
  forgotPassword,
  resetPassword,
  logout,
  getCurrentUser,
} = require("../controllers/auth.controller");

const authenticate = require("../middleware/authenticate");
const rateLimiter = require("express-rate-limit");

// Rate limiting for auth routes
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: {
    msg: "Too many requests from this IP, please try again after 15 minutes",
  },
});

// Public routes
router.post("/register", apiLimiter, register);
router.post("/verify-email", apiLimiter, verifyEmail);
router.post("/login", apiLimiter, login);
router.post("/forgot-password", apiLimiter, forgotPassword);
router.post("/reset-password", apiLimiter, resetPassword);

// Protected routes
router.delete("/logout", authenticate, logout);
router.get("/me", authenticate, getCurrentUser);

module.exports = router;
