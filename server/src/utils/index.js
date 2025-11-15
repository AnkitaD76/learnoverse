import sendVerificationEmail from './sendVerificationEmail.js';
import sendResetPasswordEmail from './sendResetPasswordEmail.js';
import { sendEmail } from './sendEmail.js';
import {
    createJWT,
    verifyJWT,
    createAccessToken,
    createRefreshToken,
    attachCookiesToResponse,
    clearAuthCookies,
} from './jwt.js';
import { createTokenUser } from './createTokenUser.js';
import {
    createHash,
    generateToken,
    generateVerificationToken,
    generatePasswordResetToken,
} from './createHash.js';
import {
    checkPermissions,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    authorizePermissions,
} from './checkPermissions.js';

export {
    sendVerificationEmail,
    sendResetPasswordEmail,
    sendEmail,
    createJWT,
    verifyJWT,
    createAccessToken,
    createRefreshToken,
    attachCookiesToResponse,
    clearAuthCookies,
    createTokenUser,
    createHash,
    generateToken,
    generateVerificationToken,
    generatePasswordResetToken,
    checkPermissions,
    hasRole,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    authorizePermissions,
};
