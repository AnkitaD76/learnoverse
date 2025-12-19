import { UnauthorizedError } from '../errors/index.js';

/**
 * Middleware to authorize users based on their roles
 * @param {...string} roles - Array of allowed roles
 * @returns {Function} Express middleware function
 */
export const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            throw new UnauthorizedError('Authentication required');
        }

        // Check if user's role is in the allowed roles
        if (!roles.includes(req.user.role)) {
            throw new UnauthorizedError(
                `Access denied. Required role(s): ${roles.join(', ')}`
            );
        }

        next();
    };
};
