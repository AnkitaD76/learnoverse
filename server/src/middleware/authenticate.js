import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors/index.js';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
    try {
        // Check for token in authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthenticatedError('Authentication invalid');
        }

        const token = authHeader.split(' ')[1];

        // Verify token
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // Get user
        const user = await User.findById(payload.userId).select('-password');

        if (!user) {
            throw new UnauthenticatedError('User not found');
        }

        if (user.status !== 'active') {
            throw new UnauthenticatedError('Account is not active');
        }

        if (!user.isVerified && process.env.NODE_ENV === 'production') {
            throw new UnauthenticatedError('Please verify your email first');
        }

        // Update last active timestamp (don't await to avoid blocking)
        User.findByIdAndUpdate(user._id, { lastActive: Date.now() }).catch(
            err => console.error('Failed to update last active:', err)
        );

        // Add user to request object
        req.user = {
            userId: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            throw new UnauthenticatedError('Invalid token');
        }
        if (error.name === 'TokenExpiredError') {
            throw new UnauthenticatedError('Token expired');
        }
        throw new UnauthenticatedError('Authentication invalid');
    }
};
