import Profile from '../models/Profile.js';
import User from '../models/User.js';
import { StatusCodes } from 'http-status-codes';
import { BadRequestError, NotFoundError, UnauthenticatedError } from '../errors/index.js';

// Get user's profile
export const getProfile = async (req, res) => {
  const { userId } = req.params;

  const profile = await Profile.findOne({ userId }).populate('userId', 'email firstName lastName role');

  if (!profile) {
    throw new NotFoundError('Profile not found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    profile,
  });
};

// Get current authenticated user's profile
export const getMyProfile = async (req, res) => {
  const { userId } = req.user;

  const profile = await Profile.findOne({ userId });

  if (!profile) {
    throw new NotFoundError('Profile not found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    profile,
  });
};

// Update profile
export const updateProfile = async (req, res) => {
  const { userId } = req.user;
  const { bio, location, phone, occupation, website, socialLinks, isPublic } = req.body;

  // Validate input
  if (bio && bio.length > 500) {
    throw new BadRequestError('Bio cannot exceed 500 characters');
  }
  if (location && location.length > 100) {
    throw new BadRequestError('Location cannot exceed 100 characters');
  }
  if (phone && phone.length > 20) {
    throw new BadRequestError('Phone number cannot exceed 20 characters');
  }
  if (occupation && occupation.length > 100) {
    throw new BadRequestError('Occupation cannot exceed 100 characters');
  }

  const updateData = {
    ...(bio !== undefined && { bio }),
    ...(location !== undefined && { location }),
    ...(phone !== undefined && { phone }),
    ...(occupation !== undefined && { occupation }),
    ...(website !== undefined && { website }),
    ...(socialLinks !== undefined && { socialLinks }),
    ...(isPublic !== undefined && { isPublic }),
  };

  const profile = await Profile.findOneAndUpdate(
    { userId },
    updateData,
    { new: true, runValidators: true }
  );

  if (!profile) {
    throw new NotFoundError('Profile not found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile updated successfully',
    profile,
  });
};

// Delete/Reset profile
export const deleteProfile = async (req, res) => {
  const { userId } = req.user;

  const profile = await Profile.findOneAndRemove(
    { userId },
    { new: true }
  );

  if (!profile) {
    throw new NotFoundError('Profile not found');
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Profile deleted successfully',
  });
};
