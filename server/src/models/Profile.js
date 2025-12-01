import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot exceed 500 characters'],
      default: '',
    },
    avatar: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      maxlength: [100, 'Location cannot exceed 100 characters'],
      default: '',
    },
    phone: {
      type: String,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
      default: '',
    },
    occupation: {
      type: String,
      maxlength: [100, 'Occupation cannot exceed 100 characters'],
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    socialLinks: {
      twitter: {
        type: String,
        default: '',
      },
      linkedin: {
        type: String,
        default: '',
      },
      github: {
        type: String,
        default: '',
      },
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Profile', profileSchema);
