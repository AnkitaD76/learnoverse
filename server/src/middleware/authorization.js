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

// /**
//  * Middleware to authorize admin users only
//  */
// export const authorizeAdmin = (req, res, next) => {
//     if (!req.user) {
//         throw new UnauthorizedError('Authentication required');
//     }

//     if (req.user.role !== 'admin') {
//         throw new UnauthorizedError('Admin access required');
//     }

//     next();
// };

// /**
//  * Middleware to authorize instructors and admins
//  */
// export const authorizeInstructor = (req, res, next) => {
//     if (!req.user) {
//         throw new UnauthorizedError('Authentication required');
//     }

//     const allowedRoles = ['admin', 'instructor'];
//     if (!allowedRoles.includes(req.user.role)) {
//         throw new UnauthorizedError('Instructor or admin access required');
//     }

//     next();
// };

// /**
//  * Middleware to authorize moderators and admins
//  */
// export const authorizeModerator = (req, res, next) => {
//     if (!req.user) {
//         throw new UnauthorizedError('Authentication required');
//     }

//     const allowedRoles = ['admin', 'moderator', 'instructor'];
//     if (!allowedRoles.includes(req.user.role)) {
//         throw new UnauthorizedError(
//             'Moderator, instructor, or admin access required'
//         );
//     }

//     next();
// };

// /**
//  * Middleware to authorize resource owner or admin
//  * Checks if the authenticated user is either the owner of the resource or an admin
//  */
// export const authorizeOwnerOrAdmin = (req, res, next) => {
//     if (!req.user) {
//         throw new UnauthorizedError('Authentication required');
//     }

//     const isAdmin = req.user.role === 'admin';
//     const isOwner =
//         req.user.userId.toString() === req.params.id?.toString() ||
//         req.user.userId.toString() === req.params.userId?.toString();

//     if (!isAdmin && !isOwner) {
//         throw new UnauthorizedError(
//             'You do not have permission to access this resource'
//         );
//     }

//     next();
// };
