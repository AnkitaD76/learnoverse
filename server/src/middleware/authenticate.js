import jwt from 'jsonwebtoken';
import { UnauthenticatedError } from '../errors/index.js';
import { User } from '../models/User.js';

export const authenticate = async (req, res, next) => {
  try {
    // Check for token in authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthenticatedError('Authentication invalid');
    }

    const token = authHeader.split(' ')[1];

    // Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Get user and populate roles
    const user = await User.findById(payload.userId)
      .populate({
        path: 'roles',
        select: 'name permissions level -_id',
      })
      .select('-password');

    if (!user) {
      throw new UnauthenticatedError('User not found');
    }

    if (user.status !== 'active') {
      throw new UnauthenticatedError('Account is not active');
    }

    if (!user.isVerified) {
      throw new UnauthenticatedError('Please verify your email first');
    }

    // Update last active timestamp
    await User.findByIdAndUpdate(user._id, { lastActive: Date.now() });

    // Add user to request object
    req.user = user;
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};
