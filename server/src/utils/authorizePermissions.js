import { UnauthorizedError } from '../errors/index.js';

const authorizePermissions = requiredPermissions => {
    return async (req, res, next) => {
        try {
            const userRole = req.user.role;

            // Admin has full access
            if (userRole === 'admin') {
                return next();
            }

            // For simple role-based authorization, check if required permission needs admin
            // In this simplified version, we check resource 'all' with action 'manage' = admin only
            const requiresAdmin = requiredPermissions.some(
                perm => perm.resource === 'all' && perm.action === 'manage'
            );

            if (requiresAdmin) {
                throw new UnauthorizedError(
                    'You do not have permission to perform this action'
                );
            }

            // Check specific permissions based on role
            // Instructor can create courses, content, assignments, grades
            if (userRole === 'instructor') {
                const hasPermission = requiredPermissions.every(
                    ({ resource, action }) => {
                        const instructorPermissions = {
                            courses: ['create', 'read', 'update', 'delete'],
                            content: ['create', 'read', 'update', 'delete'],
                            assignments: ['create', 'read', 'update', 'delete'],
                            grades: ['create', 'read', 'update'],
                            students: ['read'],
                        };

                        return (
                            instructorPermissions[resource] &&
                            instructorPermissions[resource].includes(action)
                        );
                    }
                );

                if (hasPermission) {
                    return next();
                }
            }

            // Student has read-only access to courses and content
            if (userRole === 'student') {
                const hasPermission = requiredPermissions.every(
                    ({ resource, action }) => {
                        const studentPermissions = {
                            courses: ['read'],
                            content: ['read'],
                            assignments: ['read', 'create'], // Can submit
                            profile: ['read', 'update'], // Own profile
                        };

                        return (
                            studentPermissions[resource] &&
                            studentPermissions[resource].includes(action)
                        );
                    }
                );

                if (hasPermission) {
                    return next();
                }
            }

            throw new UnauthorizedError(
                'You do not have permission to perform this action'
            );
        } catch (error) {
            next(error);
        }
    };
};

// Helper function to create permission requirements
authorizePermissions.createPermission = (resource, action) => ({
    resource,
    action,
});

export default authorizePermissions;
