import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors/index.js';
import RefreshToken from '../models/RefreshToken.js';

const createAccessToken = payload => {
    if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET is not defined in environment variables');
    }
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const createRefreshToken = payload => {
    if (!process.env.JWT_REFRESH_SECRET) {
        throw new Error(
            'JWT_REFRESH_SECRET is not defined in environment variables'
        );
    }
    return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
        expiresIn: '30d',
    });
};

const verifyAccessToken = token => {
    try {
        if (!process.env.JWT_SECRET) {
            throw new Error(
                'JWT_SECRET is not defined in environment variables'
            );
        }
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new UnauthenticatedError(
            error.name === 'TokenExpiredError'
                ? 'Access token has expired'
                : 'Invalid access token'
        );
    }
};

const verifyRefreshToken = async token => {
    try {
        if (!process.env.JWT_REFRESH_SECRET) {
            throw new Error(
                'JWT_REFRESH_SECRET is not defined in environment variables'
            );
        }

        // First verify the token signature
        const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

        // Then check if token exists in database and is not expired or revoked
        const storedToken = await RefreshToken.findOne({
            token,
            user: decoded.userId,
            expiresAt: { $gt: new Date() },
            isRevoked: false,
        });

        if (!storedToken) {
            throw new Error('Refresh token is invalid or expired');
        }

        return decoded;
    } catch (error) {
        throw new UnauthenticatedError(
            error.name === 'TokenExpiredError'
                ? 'Refresh token has expired'
                : 'Invalid refresh token'
        );
    }
};

const removeRefreshToken = async token => {
    try {
        await RefreshToken.deleteOne({ token });
    } catch (error) {
        console.error('Error removing refresh token:', error);
        throw new Error('Failed to remove refresh token');
    }
};

const rotateRefreshToken = async (oldToken, user) => {
    try {
        // Create new refresh token
        const newRefreshToken = createRefreshToken(user);

        // Store new refresh token with expiry
        await RefreshToken.create({
            user: user.userId,
            token: newRefreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            isRevoked: false,
        });

        // Revoke old refresh token
        await RefreshToken.findOneAndUpdate(
            { token: oldToken },
            { isRevoked: true }
        );

        return newRefreshToken;
    } catch (error) {
        console.error('Error rotating refresh token:', error);
        throw new Error('Failed to rotate refresh token');
    }
};

const cleanupExpiredTokens = async () => {
    try {
        const result = await RefreshToken.deleteMany({
            $or: [{ expiresAt: { $lte: new Date() } }, { isRevoked: true }],
        });
        console.log(`Cleaned up ${result.deletedCount} expired/revoked tokens`);
    } catch (error) {
        console.error('Error cleaning up tokens:', error);
    }
};

const sendTokenResponse = async ({
    res,
    user,
    statusCode = 200,
    userAgent = 'Unknown',
    ipAddress = 'Unknown',
}) => {
    try {
        // Create tokens
        const accessToken = createAccessToken(user);
        const refreshToken = createRefreshToken(user);

        // Store refresh token in database with device info
        await RefreshToken.create({
            user: user.userId,
            token: refreshToken,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            isRevoked: false,
            userAgent,
            ipAddress,
            device: userAgent.includes('Mobile') ? 'Mobile' : 'Desktop',
        });

        cleanupExpiredTokens().catch(console.error);

        // Set secure cookies
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            signed: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            // sameSite: 'strict',
        };

        res.cookie('refreshToken', refreshToken, cookieOptions);

        // Send response
        return res.status(statusCode).json({
            success: true,
            user,
            accessToken,
        });
    } catch (error) {
        console.error('Error sending token response:', error);
        throw new Error('Failed to generate authentication tokens');
    }
};

export default {
    createAccessToken,
    createRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    removeRefreshToken,
    rotateRefreshToken,
    cleanupExpiredTokens,
    sendTokenResponse,
};
