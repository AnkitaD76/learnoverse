const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    avatar: {
      type: String,
      default: "default-avatar.png",
    },
    bio: {
      type: String,
      maxlength: 500,
    },
    location: {
      type: String,
      maxlength: 100,
    },
    expertise: [
      {
        type: String,
        maxlength: 50,
      },
    ],
    education: [
      {
        institution: {
          type: String,
          required: true,
        },
        degree: String,
        field: String,
        startDate: Date,
        endDate: Date,
        current: {
          type: Boolean,
          default: false,
        },
      },
    ],
    experience: [
      {
        title: {
          type: String,
          required: true,
        },
        company: String,
        location: String,
        startDate: Date,
        endDate: Date,
        current: {
          type: Boolean,
          default: false,
        },
        description: String,
      },
    ],
    socialLinks: {
      linkedin: {
        type: String,
        match: [/^https?:\/\/.*/, "Please provide a valid URL"],
      },
      github: {
        type: String,
        match: [/^https?:\/\/.*/, "Please provide a valid URL"],
      },
      twitter: {
        type: String,
        match: [/^https?:\/\/.*/, "Please provide a valid URL"],
      },
      website: {
        type: String,
        match: [/^https?:\/\/.*/, "Please provide a valid URL"],
      },
    },
    preferences: {
      emailNotifications: {
        type: Boolean,
        default: true,
      },
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "system",
      },
      language: {
        type: String,
        enum: ["en", "es", "fr", "de"],
        default: "en",
      },
    },
    stats: {
      coursesCompleted: {
        type: Number,
        default: 0,
      },
      certificatesEarned: {
        type: Number,
        default: 0,
      },
      teachingHours: {
        type: Number,
        default: 0,
      },
      averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0,
      },
    },
  },
  { timestamps: true },
);

// Add virtual for full URL of avatar
ProfileSchema.virtual("avatarUrl").get(function () {
  if (this.avatar && !this.avatar.startsWith("http")) {
    return `${process.env.BASE_URL}/uploads/avatars/${this.avatar}`;
  }
  return this.avatar;
});

// Ensure virtual fields are included in JSON output
ProfileSchema.set("toJSON", { virtuals: true });
ProfileSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Profile", ProfileSchema);
