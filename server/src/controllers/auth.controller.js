import { StatusCodes } from 'http-status-codes';
import crypto from 'crypto';
import User from '../models/User.js';
import RefreshToken from '../models/RefreshToken.js';
import {
    BadRequestError,
    UnauthenticatedError,
    NotFoundError,
} from '../errors/index.js';
import createTokenUser from '../utils/createTokenUser.js';
import sendVerificationEmail from '../utils/sendVerificationEmail.js';
import sendResetPasswordEmail from '../utils/sendResetPasswordEmail.js';
import createHash from '../utils/createHash.js';
import jwt from '../utils/jwt.js';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
    const { email, name, password, age, gender, location, occupation } =
        req.body;

    // Validate required fields
    if (!email || !name || !password) {
        throw new BadRequestError('Please provide email, name, and password');
    }

    // Check if email already exists
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        throw new BadRequestError('Email already exists');
    }

    // Check if this is the first account (make them admin)
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'student';

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role,
        age,
        gender,
        location,
        occupation,
        verificationToken: createHash(verificationToken),
        verificationTokenExpiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send verification email (in production)
    // TODO: sending the email in development mode for testing purposes
    if (process.env.NODE_ENV === 'development') {
        const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
        await sendVerificationEmail({
            name: user.name,
            email: user.email,
            verificationToken,
            origin,
        });
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        message:
            process.env.NODE_ENV === 'development'
                ? 'Registration successful! Please check your email to verify your account.'
                : `Registration successful! Verification token: ${verificationToken}`,
        user: {
            name: user.name,
            email: user.email,
            role: user.role,
        },
    });
};

/**
 * @desc    Verify user email
 * @route   POST /api/v1/auth/verify-email
 * @access  Public
 */
export const verifyEmail = async (req, res) => {
    const { verificationToken, email } = req.body;

    if (!verificationToken || !email) {
        throw new BadRequestError(
            'Please provide verification token and email'
        );
    }

    const user = await User.findOne({ email }).select(
        '+verificationToken +verificationTokenExpiry'
    );

    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (user.isVerified) {
        throw new BadRequestError('Email is already verified');
    }

    // Hash the token and compare
    const hashedToken = createHash(verificationToken);

    if (user.verificationToken !== hashedToken) {
        throw new UnauthenticatedError('Invalid verification token');
    }

    if (user.verificationTokenExpiry < Date.now()) {
        throw new UnauthenticatedError('Verification token has expired');
    }

    // Update user
    user.isVerified = true;
    user.verified = Date.now();
    user.verificationToken = undefined;
    user.verificationTokenExpiry = undefined;
    await user.save();

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Email verified successfully! You can now login.',
    });
};

/**
 * @desc    Login user
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        throw new BadRequestError('Please provide email and password');
    }

    // Find user and include password field
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
        throw new UnauthenticatedError(
            'Account is temporarily locked due to too many failed login attempts. Please try again later.'
        );
    }

    // Check if account is active
    if (user.status !== 'active') {
        throw new UnauthenticatedError(
            `Account is ${user.status}. Please contact support.`
        );
    }

    // Check if email is verified (can be disabled for development)
    if (!user.isVerified && process.env.NODE_ENV === 'development') {
        throw new UnauthenticatedError(
            'Please verify your email before logging in'
        );
    }

    // Compare password
    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
        // Increment login attempts
        await user.incLoginAttempts();
        throw new UnauthenticatedError('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
        await user.resetLoginAttempts();
    }

    // Update last active
    user.lastActive = Date.now();
    await user.save();

    // Create token user object
    const tokenUser = createTokenUser(user);

    // Get device information for session tracking
    const userAgent = req.headers['user-agent'] || 'Unknown';
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Send token response with refresh token stored
    await jwt.sendTokenResponse({
        res,
        user: tokenUser,
        statusCode: StatusCodes.OK,
        userAgent,
        ipAddress,
    });
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
    // Get refresh token from cookie
    const { refreshToken } = req.signedCookies;

    if (refreshToken) {
        // Remove refresh token from database
        await jwt.removeRefreshToken(refreshToken);
    }

    // Clear cookies
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Logged out successfully',
    });
};

/**
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (requires refresh token)
 */
export const refreshToken = async (req, res) => {
    // Get refresh token from cookie or header
    const refreshToken =
        req.signedCookies.refreshToken || req.headers['x-refresh-token'];

    if (!refreshToken) {
        throw new UnauthenticatedError('Refresh token not provided');
    }

    // Verify refresh token
    const decoded = await jwt.verifyRefreshToken(refreshToken);

    // Get user
    const user = await User.findById(decoded.userId);

    if (!user) {
        throw new UnauthenticatedError('User not found');
    }

    if (user.status !== 'active') {
        throw new UnauthenticatedError('Account is not active');
    }

    // Create new token user object
    const tokenUser = createTokenUser(user);

    // Create new access token
    const newAccessToken = jwt.createAccessToken(tokenUser);

    // Optionally rotate refresh token (recommended for security)
    const newRefreshToken = await jwt.rotateRefreshToken(
        refreshToken,
        tokenUser
    );

    // Update refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'development',
        signed: true,
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        sameSite: 'strict',
    });

    res.status(StatusCodes.OK).json({
        success: true,
        accessToken: newAccessToken,
        user: tokenUser,
    });
};

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
    // User is attached to req by authenticate middleware
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        user,
    });
};

/**
 * @desc    Forgot password - Send reset email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new BadRequestError('Please provide email');
    }

    const user = await User.findOne({ email });

    if (!user) {
        // Don't reveal if user exists or not (security)
        res.status(StatusCodes.OK).json({
            success: true,
            message:
                'If an account exists with that email, a password reset link has been sent.',
        });
        return;
    }

    // Create reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = createHash(resetToken);
    user.passwordResetExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send reset email
    const origin = process.env.FRONTEND_URL || 'http://localhost:5173';

    try {
        await sendResetPasswordEmail({
            name: user.name,
            email: user.email,
            token: resetToken,
            origin,
        });

        res.status(StatusCodes.OK).json({
            success: true,
            message:
                'If an account exists with that email, a password reset link has been sent.',
        });
    } catch (error) {
        // Clear reset token if email fails
        user.passwordResetToken = undefined;
        user.passwordResetExpiry = undefined;
        await user.save();

        throw new BadRequestError(
            'Failed to send password reset email. Please try again.'
        );
    }
};

/**
 * @desc    Reset password
 * @route   POST /api/v1/auth/reset-password
 * @access  Public
 */
export const resetPassword = async (req, res) => {
    const { token, email, password } = req.body;

    if (!token || !email || !password) {
        throw new BadRequestError(
            'Please provide token, email, and new password'
        );
    }

    const user = await User.findOne({ email }).select(
        '+passwordResetToken +passwordResetExpiry'
    );

    if (!user) {
        throw new UnauthenticatedError('Invalid or expired reset token');
    }

    // Hash token and compare
    const hashedToken = createHash(token);

    if (user.passwordResetToken !== hashedToken) {
        throw new UnauthenticatedError('Invalid or expired reset token');
    }

    if (user.passwordResetExpiry < Date.now()) {
        throw new UnauthenticatedError('Reset token has expired');
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpiry = undefined;
    user.passwordChangedAt = Date.now();
    await user.save();

    // Revoke all existing refresh tokens (force re-login on all devices)
    await RefreshToken.revokeAllForUser(user._id);

    res.status(StatusCodes.OK).json({
        success: true,
        message:
            'Password reset successfully! Please login with your new password.',
    });
};

/**
 * @desc    Update password (for logged in users)
 * @route   PATCH /api/v1/auth/update-password
 * @access  Private
 */
export const updatePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        throw new BadRequestError(
            'Please provide current password and new password'
        );
    }

    // Get user with password
    const user = await User.findById(req.user.userId).select('+password');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Verify current password
    const isPasswordCorrect = await user.comparePassword(currentPassword);

    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Current password is incorrect');
    }

    // Update password
    user.password = newPassword;
    await user.save();

    // Revoke all refresh tokens except current session
    const currentRefreshToken = req.signedCookies.refreshToken;
    if (currentRefreshToken) {
        await RefreshToken.updateMany(
            {
                user: user._id,
                token: { $ne: currentRefreshToken },
                isRevoked: false,
            },
            {
                isRevoked: true,
                revokedAt: new Date(),
            }
        );
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Password updated successfully',
    });
};

/**
 * @desc    Get active sessions
 * @route   GET /api/v1/auth/sessions
 * @access  Private
 */
export const getActiveSessions = async (req, res) => {
    const sessions = await RefreshToken.getActiveSessions(req.user.userId);

    res.status(StatusCodes.OK).json({
        success: true,
        count: sessions.length,
        sessions,
    });
};

/**
 * @desc    Revoke all sessions (logout from all devices)
 * @route   POST /api/v1/auth/revoke-all-sessions
 * @access  Private
 */
export const revokeAllSessions = async (req, res) => {
    await RefreshToken.revokeAllForUser(req.user.userId);

    // Clear current cookie
    res.cookie('refreshToken', '', {
        httpOnly: true,
        expires: new Date(0),
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'All sessions revoked successfully. Please login again.',
    });
};

export default {
    register,
    verifyEmail,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    forgotPassword,
    resetPassword,
    updatePassword,
    getActiveSessions,
    revokeAllSessions,
};
