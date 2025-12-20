import { StatusCodes } from 'http-status-codes';
import { User, Course, Enrollment, SkillSwapRequest } from '../models/index.js';
import { NotFoundError } from '../errors/index.js';

/**
 * GET /api/v1/dashboard
 * Returns stats + recommendations + skill-swap matches
 */
export const getDashboardData = async (req, res) => {
  const userId = req.user.userId;

  const user = await User.findById(userId);
  if (!user) throw new NotFoundError('User not found');

  // Active enrollments
  const activeEnrollments = await Enrollment.find({
    user: userId,
    status: 'enrolled',
  }).populate('course', 'title category level pricePoints instructor');

  const enrolledCourseIds = activeEnrollments.map(e => e.course._id);

  // Recommended: courses not yet enrolled
  const recommendedCourses = await Course.find({
    _id: { $nin: enrolledCourseIds },
    isPublished: true,
  })
    .sort('-createdAt')
    .limit(6)
    .populate('instructor', 'name');

  // Popular courses (for "keep exploring" section)
  const popularCourses = await Course.find({ isPublished: true })
    .sort('-enrollCount')
    .limit(6)
    .populate('instructor', 'name');

  // Skill-swap matches
  let skillSwapMatches = [];
  if ((user.skillsOffered?.length || 0) > 0 || (user.skillsWanted?.length || 0) > 0) {
    skillSwapMatches = await User.find({
      _id: { $ne: userId },
      $or: [
        { skillsOffered: { $in: user.skillsWanted || [] } },
        { skillsWanted: { $in: user.skillsOffered || [] } },
      ],
    })
      .select('name email skillsOffered skillsWanted')
      .limit(8);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    role: user.role,
    stats: {
      totalEnrolledCourses: activeEnrollments.length,
      pointsBalance: user.pointsBalance || 0,
      totalSkillSwapsAccepted: await SkillSwapRequest.countDocuments({
        status: 'accepted',
        $or: [{ fromUser: userId }, { toUser: userId }],
      }),
    },
    enrolledCourses: activeEnrollments,
    recommendedCourses,
    popularCourses,
    skillSwapMatches,
  });
};
