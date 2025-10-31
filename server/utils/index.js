const { createJWT, isTokenValid, attachCookiesToResponse } = require("./jwt");
const createTokenUser = require("./createTokenUser");
const checkPermissions = require("./checkPermissions");
const sendVerificationEmail = require("./sendVerificationEmail");
const createHash = require("./createHash");
const authorizePermissions = require("./authorizePermissions");

module.exports = {
  createJWT,
  isTokenValid,
  attachCookiesToResponse,
  createTokenUser,
  checkPermissions,
  sendVerificationEmail,
  createHash,
  authorizePermissions,
};
