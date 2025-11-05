const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      enum: ["admin", "teacher", "student"],
      unique: true,
    },
    permissions: [
      {
        resource: {
          type: String,
          required: true,
        },
        actions: [
          {
            type: String,
            enum: ["create", "read", "update", "delete", "manage"],
            required: true,
          },
        ],
      },
    ],
    description: {
      type: String,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    level: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
  },
  { timestamps: true },
);

// Predefined roles and their permissions
RoleSchema.statics.initializeRoles = async function () {
  const roles = [
    {
      name: "admin",
      description: "Full system access",
      level: 100,
      permissions: [{ resource: "all", actions: ["manage"] }],
    },
    {
      name: "teacher",
      description: "Teaching and content management access",
      level: 50,
      permissions: [
        {
          resource: "courses",
          actions: ["create", "read", "update", "delete"],
        },
        {
          resource: "assignments",
          actions: ["create", "read", "update", "delete"],
        },
        { resource: "students", actions: ["read"] },
        { resource: "grades", actions: ["create", "read", "update"] },
      ],
    },
    {
      name: "student",
      description: "Basic learning platform access",
      level: 10,
      permissions: [
        { resource: "courses", actions: ["read"] },
        { resource: "assignments", actions: ["read"] },
        { resource: "grades", actions: ["read"] },
      ],
    },
  ];

  for (const role of roles) {
    await this.findOneAndUpdate({ name: role.name }, role, {
      upsert: true,
      new: true,
    });
  }
};

module.exports = mongoose.model("Role", RoleSchema);
