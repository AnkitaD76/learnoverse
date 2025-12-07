import { User } from '../models/index.js';
import { StatusCodes } from 'http-status-codes';
import { NotFoundError, BadRequestError } from '../errors/index.js';
import { checkPermissions } from '../utils/checkPermissions.js';
import cloudinary from '../config/cloudinaryConfig.js';
import { Readable } from 'stream';

/**
 * @desc    Get all users
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
export const getAllUsers = async (req, res) => {
    const users = await User.find({ role: { $ne: 'admin' } }).select(
        '-password'
    );

    res.status(StatusCodes.OK).json({
        success: true,
        count: users.length,
        users,
    });
};

/**
 * @desc    Get single user
 * @route   GET /api/v1/users/:id
 * @access  Private
 */
export const getSingleUser = async (req, res) => {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
        throw new NotFoundError(`User not found with id: ${req.params.id}`);
    }

    // Check permissions - users can only view their own profile unless they're admin
    checkPermissions(req.user, user._id);

    res.status(StatusCodes.OK).json({
        success: true,
        user,
    });
};

/**
 * @desc    Show current user profile
 * @route   GET /api/v1/users/showMe
 * @access  Private
 */
export const showCurrentUser = async (req, res) => {
    const user = await User.findById(req.user.userId).select('-password');

    if (!user) {
        throw new NotFoundError('User not found');
    }

    res.status(StatusCodes.OK).json({
        success: true,
        user,
    });
};

/**
 * @desc    Update user profile
 * @route   PATCH /api/v1/users/updateUser
 * @access  Private
 */
export const updateUser = async (req, res) => {
    const {
        name,
        email,
        phone,
        country,
        city,
        bio,
        interests,
        avater,
        linkedin,
        website,
        github,
        dateOfBirth,
        gender,
    } = req.body;

    if (!name && !email) {
        throw new BadRequestError('Please provide name or email');
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    // If email is being updated, check if it's already taken
    if (email && email !== user.email) {
        const emailExists = await User.findOne({ email });
        if (emailExists) {
            throw new BadRequestError('Email already in use');
        }
        // Reset email verification if email changes
        user.isVerified = false;
        user.email = email;
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (country) user.country = country;
    if (city) user.city = city;
    if (bio) user.bio = bio;
    if (interests) user.interests = interests;
    if (avater) user.avater = avater;
    if (linkedin) user.linkedin = linkedin;
    if (website) user.website = website;
    if (github) user.github = github;
    if (dateOfBirth) user.dateOfBirth = dateOfBirth;
    if (gender) user.gender = gender;

    await user.save();

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'User profile updated successfully',
        user,
    });
};

/**
 * @desc Upload avatar image to Cloudinary
 * @route PATCH /api/v1/users/uploadAvatar
 * @access Private
 */
export const uploadAvatar = async (req, res) => {
    if (!req.file) {
        throw new BadRequestError('No file uploaded');
    }

    const user = await User.findById(req.user.userId);
    if (!user) throw new NotFoundError('User not found');

    // Upload to Cloudinary using buffer stream
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: 'learnoverse/avatars',
                public_id: `${req.user.userId}-${Date.now()}`,
                resource_type: 'auto',
                quality: 'auto',
            },
            async (error, result) => {
                if (error) {
                    reject(new BadRequestError(`Upload failed: ${error.message}`));
                    return;
                }

                try {
                    // Save Cloudinary secure_url to database
                    user.avatar = result.secure_url;
                    await user.save();

                    res.status(StatusCodes.OK).json({
                        success: true,
                        message: 'Avatar uploaded successfully',
                        avatar: result.secure_url,
                        user,
                    });
                    resolve();
                } catch (err) {
                    reject(err);
                }
            }
        );

        // Pipe file buffer to Cloudinary stream
        Readable.from(req.file.buffer).pipe(stream);
    });
};

/**
 * @desc    Update user password
 * @route   PATCH /api/v1/users/updateUserPassword
 * @access  Private
 */
export const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
        throw new BadRequestError('Please provide old and new password');
    }

    if (newPassword.length < 6) {
        throw new BadRequestError(
            'Password must be at least 6 characters long'
        );
    }

    const user = await User.findById(req.user.userId);

    if (!user) {
        throw new NotFoundError('User not found');
    }

    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new BadRequestError('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'Password updated successfully',
    });
};

/**
 * @desc    Delete user account
 * @route   DELETE /api/v1/users/:id
 * @access  Private
 */
export const deleteUser = async (req, res) => {
    const user = await User.findById(req.params.id);

    if (!user) {
        throw new NotFoundError(`User not found with id: ${req.params.id}`);
    }

    // Check permissions
    checkPermissions(req.user, user._id);

    await user.deleteOne();

    res.status(StatusCodes.OK).json({
        success: true,
        message: 'User account deleted successfully',
    });
};
