const { UnauthorizedError } = require("../errors");

const authorizePermissions = (requiredPermissions) => {
  return (req, res, next) => {
    // Get user roles from authenticated request
    const userRoles = req.user.roles;

    // Check if user has admin role
    const isAdmin = userRoles.some((role) => role.name === "admin");
    if (isAdmin) {
      return next(); // Admin has full access
    }

    // For other roles, check specific permissions
    const hasPermission = userRoles.some((role) => {
      return role.permissions.some((permission) => {
        // Check if the role has full management permission
        if (
          permission.resource === "all" &&
          permission.actions.includes("manage")
        ) {
          return true;
        }

        // Check specific resource and action permissions
        return requiredPermissions.every(({ resource, action }) => {
          return (
            permission.resource === resource &&
            permission.actions.includes(action)
          );
        });
      });
    });

    if (!hasPermission) {
      throw new UnauthorizedError(
        "You do not have permission to perform this action",
      );
    }

    next();
  };
};

// Helper function to create permission requirements
authorizePermissions.createPermission = (resource, action) => ({
  resource,
  action,
});

module.exports = authorizePermissions;
