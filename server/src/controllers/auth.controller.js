import crypto from 'crypto';
import { StatusCodes } from 'http-status-codes';
import { User, RefreshToken } from '../models/index.js';
import {
    BadRequestError,
    UnauthenticatedError,
    NotFoundError,
} from '../errors/index.js';
import {
    createAccessToken,
    createRefreshToken,
    attachCookiesToResponse,
    clearAuthCookies,
    verifyJWT,
} from '../utils/jwt.js';
import { createTokenUser } from '../utils/createTokenUser.js';
import sendVerificationEmail from '../utils/sendVerificationEmail.js';
import sendResetPasswordEmail from '../utils/sendResetPasswordEmail.js';
import { createHash } from '../utils/createHash.js';

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    // Validate input
    if (!name || !email || !password) {
        throw new BadRequestError('Please provide name, email, and password');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new BadRequestError('Email already registered');
    }

    // Prevent users from self-assigning admin role
    const userRole = role === 'admin' ? 'student' : role || 'student';

    // Check if this is the first user - make them admin
    const isFirstUser = (await User.countDocuments({})) === 0;
    const assignedRole = isFirstUser ? 'admin' : userRole;

    // Generate verification token
    const verificationToken = crypto.randomBytes(40).toString('hex');

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role: assignedRole,
        verificationToken,
        verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    });

    // Send verification email
    try {
        const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
        await sendVerificationEmail({
            name: user.name,
            email: user.email,
            verificationToken,
            origin,
        });
    } catch (error) {
        const newUser = await User.findById(user._id);
        await newUser.deleteOne();
        // throw new Error('Error sending verification email. Please try again.');
        console.log(error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Error sending verification email. Please try again.',
        });
        return;
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        message:
            'Registration successful! Please check your email to verify your account.',
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

    const user = await User.findOne({ email });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    if (user.isVerified) {
        throw new BadRequestError('Email already verified');
    }

    // Check if token matches and is not expired
    if (
        user.verificationToken !== verificationToken ||
        user.verificationTokenExpires < Date.now()
    ) {
        throw new UnauthenticatedError('Invalid or expired verification token');
    }

    // Update user
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
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

    const user = await User.findOne({ email });

    if (!user) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
        throw new UnauthenticatedError('Account is deactivated');
    }

    // Verify password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError('Invalid credentials');
    }

    // Check if email is verified
    if (!user.isVerified) {
        throw new UnauthenticatedError(
            'Please verify your email before logging in'
        );
    }

    // Create token user
    const tokenUser = createTokenUser(user);

    // Create refresh token
    let refreshToken = '';

    // Check for existing refresh token
    const existingToken = await RefreshToken.findOne({ user: user._id });

    if (existingToken) {
        if (!existingToken.isValid) {
            throw new UnauthenticatedError('Invalid credentials');
        }
        refreshToken = existingToken.refreshToken;
    } else {
        // Create new refresh token
        refreshToken = createRefreshToken(user);
        const userAgent = req.headers['user-agent'] || 'unknown';
        const ip = req.ip;

        await RefreshToken.create({
            refreshToken,
            user: user._id,
            userAgent,
            ip,
        });
    }

    // Create access token
    const accessToken = createAccessToken(user);

    // Attach cookies
    attachCookiesToResponse({ res, accessToken, refreshToken });

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Login successful',
        user: tokenUser,
    });
};

/**
 * @desc    Logout user
 * @route   POST /api/v1/auth/logout
 * @access  Private
 */
export const logout = async (req, res) => {
    const { refreshToken } = req.signedCookies;

    if (refreshToken) {
        // Delete refresh token from database
        await RefreshToken.findOneAndDelete({ refreshToken });
    }

    // Clear cookies
    clearAuthCookies(res);

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Logout successful',
    });
};

/**
 * @desc    Forgot password - send reset email
 * @route   POST /api/v1/auth/forgot-password
 * @access  Public
 */
export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new BadRequestError('Please provide email');
    }

    const user = await User.findOne({ email });

    if (user) {
        // Generate password reset token
        const passwordResetToken = crypto.randomBytes(40).toString('hex');

        // Hash the token before saving to database
        const hashedToken = createHash(passwordResetToken);

        // Save hashed token to user
        user.passwordResetToken = hashedToken;
        user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
        await user.save();

        // Send email with unhashed token
        const origin = process.env.FRONTEND_URL || 'http://localhost:5173';
        await sendResetPasswordEmail({
            name: user.name,
            email: user.email,
            token: passwordResetToken,
            origin,
        });
    }

    // Always send success message (security best practice)
    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Password reset email sent. Please check your email.',
    });
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

    if (password.length < 6) {
        throw new BadRequestError(
            'Password must be at least 6 characters long'
        );
    }

    const user = await User.findOne({ email });

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // Hash the provided token to compare with stored hash
    const hashedToken = createHash(token);

    // Check if token matches and is not expired
    if (
        user.passwordResetToken !== hashedToken ||
        user.passwordResetExpires < Date.now()
    ) {
        throw new UnauthenticatedError('Invalid or expired reset token');
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Invalidate all existing refresh tokens
    await RefreshToken.deleteMany({ user: user._id });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Password reset successful. You can now login.',
    });
};

/**
 * @desc    Get current user
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
export const getCurrentUser = async (req, res) => {
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
 * @desc    Refresh access token
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (requires refresh token in cookie)
 */
export const refreshAccessToken = async (req, res) => {
    const { refreshToken } = req.signedCookies;

    if (!refreshToken) {
        throw new UnauthenticatedError('No refresh token provided');
    }

    // Verify refresh token
    let payload;
    try {
        payload = verifyJWT(refreshToken);
    } catch (error) {
        throw new UnauthenticatedError('Invalid refresh token');
    }

    // Check if refresh token exists in database
    const existingToken = await RefreshToken.findOne({
        refreshToken,
        user: payload.userId,
    });

    if (!existingToken || !existingToken.isValid) {
        throw new UnauthenticatedError('Invalid refresh token');
    }

    // Get user
    const user = await User.findById(payload.userId);

    if (!user || !user.isActive) {
        throw new UnauthenticatedError('User not found or inactive');
    }

    // Create new access token
    const accessToken = createAccessToken(user);

    // Attach new access token to cookies
    attachCookiesToResponse({ res, accessToken, refreshToken });

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Access token refreshed successfully',
    });
};
