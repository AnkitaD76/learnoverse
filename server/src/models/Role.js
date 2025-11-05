import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Role name is required'],
            unique: true,
            trim: true,
            lowercase: true,
            enum: {
                values: ['admin', 'instructor', 'student'],
                message: '{VALUE} is not a valid role',
            },
        },
        displayName: {
            type: String,
            required: [true, 'Display name is required'],
            trim: true,
        },
        description: {
            type: String,
            required: [true, 'Role description is required'],
            maxlength: 500,
        },
        level: {
            type: Number,
            required: [true, 'Role level is required'],
            min: 1,
            max: 100,
            default: 1,
        },
        permissions: [
            {
                resource: {
                    type: String,
                    required: true,
                    trim: true,
                    // e.g., 'users', 'courses', 'content', 'all'
                },
                actions: {
                    type: [String],
                    required: true,
                    enum: {
                        values: [
                            'create',
                            'read',
                            'update',
                            'delete',
                            'manage',
                        ],
                        message: '{VALUE} is not a valid action',
                    },
                },
            },
        ],
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
RoleSchema.index({ name: 1 });
RoleSchema.index({ level: 1 });
RoleSchema.index({ isActive: 1 });

// Static method to get default roles configuration
RoleSchema.statics.getDefaultRoles = function () {
    return [
        {
            name: 'admin',
            displayName: 'Administrator',
            description:
                'Full system access with all permissions. Can manage users, roles, and system configuration.',
            level: 100,
            permissions: [
                {
                    resource: 'all',
                    actions: ['manage'],
                },
            ],
            isActive: true,
        },
        {
            name: 'instructor',
            displayName: 'Instructor',
            description:
                'Can create and manage courses, view student progress, and manage their own content.',
            level: 50,
            permissions: [
                {
                    resource: 'courses',
                    actions: ['create', 'read', 'update', 'delete'],
                },
                {
                    resource: 'content',
                    actions: ['create', 'read', 'update', 'delete'],
                },
                {
                    resource: 'students',
                    actions: ['read'],
                },
                {
                    resource: 'assignments',
                    actions: ['create', 'read', 'update', 'delete'],
                },
                {
                    resource: 'grades',
                    actions: ['create', 'read', 'update'],
                },
            ],
            isActive: true,
        },
        {
            name: 'student',
            displayName: 'Student',
            description:
                'Can enroll in courses, view content, submit assignments, and track their own progress.',
            level: 10,
            permissions: [
                {
                    resource: 'courses',
                    actions: ['read'],
                },
                {
                    resource: 'content',
                    actions: ['read'],
                },
                {
                    resource: 'assignments',
                    actions: ['read', 'create'], // Can submit assignments
                },
                {
                    resource: 'profile',
                    actions: ['read', 'update'], // Own profile only
                },
            ],
            isActive: true,
        },
    ];
};

// Static method to seed default roles
RoleSchema.statics.seedDefaultRoles = async function () {
    try {
        const existingRoles = await this.countDocuments();

        if (existingRoles > 0) {
            console.log('ℹ️  Roles already exist, skipping seed...');
            return;
        }

        const defaultRoles = this.getDefaultRoles();
        await this.insertMany(defaultRoles);

        console.log('✅ Default roles seeded successfully');
    } catch (error) {
        console.error('❌ Error seeding roles:', error);
        throw error;
    }
};

// Method to check if role has permission
RoleSchema.methods.hasPermission = function (resource, action) {
    // Admin has all permissions
    if (this.name === 'admin') {
        return true;
    }

    // Check if role has manage permission for all resources
    const hasManageAll = this.permissions.some(
        perm => perm.resource === 'all' && perm.actions.includes('manage')
    );

    if (hasManageAll) {
        return true;
    }

    // Check specific resource and action
    return this.permissions.some(
        perm => perm.resource === resource && perm.actions.includes(action)
    );
};

// Remove __v from JSON output
RoleSchema.methods.toJSON = function () {
    const role = this.toObject();
    delete role.__v;
    return role;
};

export default mongoose.model('Role', RoleSchema);
