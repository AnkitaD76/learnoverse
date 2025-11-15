import { UnauthenticatedError, UnauthorizedError } from '../errors/index.js';

/**
 * Check if the requesting user has permission to access a resource
 * Admins can access any resource, others can only access their own resources
 * @param {Object} requestUser - The authenticated user from req.user
 * @param {string} resourceUserId - The ID of the resource owner
 */
export const checkPermissions = (requestUser, resourceUserId) => {
    // Admin can access everything
    if (requestUser.role === 'admin') {
        return;
    }

    // Convert to string for comparison
    if (requestUser.userId.toString() === resourceUserId.toString()) {
        return;
    }

    throw new UnauthorizedError('Not authorized to access this resource');
};

/**
 * Check if user has a specific role
 * @param {string} userRole - The user's role
 * @param {string|Array<string>} allowedRoles - Role(s) to check against
 * @returns {boolean}
 */
export const hasRole = (userRole, allowedRoles) => {
    if (!Array.isArray(allowedRoles)) {
        allowedRoles = [allowedRoles];
    }

    return allowedRoles.includes(userRole);
};

/**
 * Check if user has any of the specified roles
 * @param {string} userRole - The user's role
 * @param {Array<string>} roles - Roles to check
 * @returns {boolean}
 */
export const hasAnyRole = (userRole, roles) => {
    if (!Array.isArray(roles)) {
        roles = [roles];
    }

    return roles.includes(userRole);
};
