import { verifyJWT } from '../utils/jwt.js';
import { User } from '../models/index.js';
import { UnauthenticatedError } from '../errors/index.js';

export const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header or cookies
        let accessToken = req.signedCookies.accessToken;

        // If no cookie, check Authorization header
        if (!accessToken) {
            const authHeader = req.headers.authorization;
            if (authHeader && authHeader.startsWith('Bearer ')) {
                accessToken = authHeader.substring(7);
            }
        }

        if (!accessToken) {
            throw new UnauthenticatedError('Authentication required');
        }

        // Verify token
        const decoded = verifyJWT(accessToken);

        // Check if user still exists
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            throw new UnauthenticatedError('User no longer exists');
        }

        // Check if user is active
        if (!user.isActive) {
            throw new UnauthenticatedError('Account is deactivated');
        }

        // Check if password was changed after token was issued
        if (user.changedPasswordAfter(decoded.iat)) {
            throw new UnauthenticatedError(
                'Password recently changed. Please login again'
            );
        }

        // Attach user to request
        req.user = {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        };

        next();
    } catch (error) {
        if (
            error.message === 'Invalid token' ||
            error.name === 'JsonWebTokenError' ||
            error.name === 'TokenExpiredError'
        ) {
            throw new UnauthenticatedError('Invalid or expired token');
        }
        throw error;
    }
};

export const requireVerification = (req, res, next) => {
    if (!req.user) {
        throw new UnauthenticatedError('Authentication required');
    }

    if (!req.user.isVerified) {
        throw new UnauthenticatedError(
            'Please verify your email to access this resource'
        );
    }

    next();
};
