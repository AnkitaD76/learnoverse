import { StatusCodes } from 'http-status-codes';
import {
  Course,
  Enrollment,
  Notification,
  SkillSwapRequest,
  User,
  Wallet,
  Transaction,
} from '../models/index.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/index.js';

export const requestSkillSwap = async (req, res) => {
  const fromUserId = req.user.userId;

  // ✅ We no longer require toUserId from frontend
  const { offeredCourseId, requestedCourseId } = req.body;

  if (!offeredCourseId || !requestedCourseId) {
    throw new BadRequestError('offeredCourseId and requestedCourseId required');
  }

  // ✅ must have created at least 1 course
  const createdCount = await Course.countDocuments({ instructor: fromUserId });
  if (createdCount < 1) {
    throw new BadRequestError('You must create at least one course before requesting a skill swap');
  }

  // ✅ offered course must belong to requester
  const offeredCourse = await Course.findById(offeredCourseId);
  if (!offeredCourse) throw new NotFoundError('Offered course not found');
  if (String(offeredCourse.instructor) !== String(fromUserId)) {
    throw new UnauthorizedError('You can only offer your own course');
  }

  // ✅ offered course should be published (recommended)
  if (!offeredCourse.isPublished) {
    throw new BadRequestError('Your offered course must be published to do a skill swap');
  }

  // ✅ requested course must exist
  const requestedCourse = await Course.findById(requestedCourseId);
  if (!requestedCourse) throw new NotFoundError('Requested course not found');

  // ✅ requested course must be published and skill swap enabled
  if (!requestedCourse.isPublished) {
    throw new BadRequestError('This course is not published yet');
  }
  if (!requestedCourse.skillSwapEnabled) {
    throw new BadRequestError('Skill swap is not enabled for this course');
  }

  // ✅ Auto detect course creator (toUser) from requested course instructor
  const toUserId = requestedCourse.instructor;

  // ✅ cannot request swap on your own course
  if (String(toUserId) === String(fromUserId)) {
    throw new BadRequestError("You can't request a skill swap on your own course");
  }

  // ✅ only ONE pending request per requester (as per your existing rule)
  const existingPending = await SkillSwapRequest.findOne({
    fromUser: fromUserId,
    status: 'pending',
  });
  if (existingPending) throw new BadRequestError('You already have a pending skill swap request');

  const swap = await SkillSwapRequest.create({
    fromUser: fromUserId,
    toUser: toUserId,
    offeredCourse: offeredCourseId,
    requestedCourse: requestedCourseId,
    status: 'pending',
  });

  // requester info for message
  const fromUser = await User.findById(fromUserId).select('name email');

  await Notification.create({
    user: toUserId,
    type: 'skill_swap_request',
    title: 'New Skill Swap Request',
    message: `${fromUser?.name || 'A user'} requested a skill swap offering "${offeredCourse.title}".`,
    data: {
      skillSwapRequestId: swap._id,
      fromUser: fromUserId,
      offeredCourseId,
      offeredCourseTitle: offeredCourse.title,
      requestedCourseId,
      requestedCourseTitle: requestedCourse.title,
    },
  });

  res
    .status(StatusCodes.CREATED)
    .json({ success: true, message: 'Skill swap request sent', swap });
};

export const respondSkillSwap = async (req, res) => {
  const toUserId = req.user.userId;
  const { action } = req.body; // "accept" or "reject"

  const swap = await SkillSwapRequest.findById(req.params.id);
  if (!swap) throw new NotFoundError('Skill swap request not found');

  if (String(swap.toUser) !== String(toUserId)) {
    throw new UnauthorizedError('Not allowed');
  }

  if (swap.status !== 'pending') {
    return res.status(StatusCodes.OK).json({ success: true, message: 'Already handled', swap });
  }

  if (action !== 'accept' && action !== 'reject') {
    throw new BadRequestError('action must be accept or reject');
  }

  // ✅ Reject flow
  if (action === 'reject') {
    swap.status = 'rejected';
    await swap.save();

    await Notification.create({
      user: swap.fromUser,
      type: 'skill_swap_response',
      title: 'Skill Swap Rejected',
      message: 'Your skill swap request was rejected.',
      data: { skillSwapRequestId: swap._id, status: 'rejected' },
    });

    return res.status(StatusCodes.OK).json({ success: true, message: 'Rejected', swap });
  }

  // ✅ Accept flow: enroll both into each other's course
  const offeredCourse = await Course.findById(swap.offeredCourse);
  if (!offeredCourse) throw new NotFoundError('Offered course not found');

  const requestedCourse = await Course.findById(swap.requestedCourse);
  if (!requestedCourse) throw new NotFoundError('Requested course not found');

  // Still valid?
  if (!requestedCourse.isPublished || !requestedCourse.skillSwapEnabled) {
    throw new BadRequestError('Requested course is not eligible for swap anymore');
  }
  if (!offeredCourse.isPublished) {
    throw new BadRequestError('Offered course is not published');
  }

  // Mark accepted
  swap.status = 'accepted';
  await swap.save();

  // helper: enroll and increment count only if newly enrolled (or was withdrawn)
  const enrollOrReEnroll = async (userId, courseId) => {
    const existing = await Enrollment.findOne({ user: userId, course: courseId });

    if (!existing) {
      await Enrollment.create({
        user: userId,
        course: courseId,
        status: 'enrolled',
        enrolledAt: new Date(),
        withdrawnAt: null,
        paymentMethod: 'SKILL_SWAP',
        pointsPaid: 0,
      });
      await Course.findByIdAndUpdate(courseId, { $inc: { enrollCount: 1 } });
      return;
    }

    if (existing.status !== 'enrolled') {
      existing.status = 'enrolled';
      existing.enrolledAt = new Date();
      existing.withdrawnAt = null;
      existing.paymentMethod = 'SKILL_SWAP';
      existing.pointsPaid = 0;
      await existing.save();
      await Course.findByIdAndUpdate(courseId, { $inc: { enrollCount: 1 } });
    }
  };

  // ✅ enroll course creator into offered course (fromUser's course)
  await enrollOrReEnroll(swap.toUser, swap.offeredCourse);

  // ✅ enroll requester into requested course (toUser's course)
  await enrollOrReEnroll(swap.fromUser, swap.requestedCourse);

  // Reward points (keep your existing bonus logic)
  try {
    const SWAP_REWARD = 10;
    const parties = [String(swap.fromUser), String(swap.toUser)];

    for (const uid of parties) {
      const existingBonus = await Transaction.findOne({
        userId: uid,
        type: 'BONUS',
        'metadata.skillSwapRequestId': String(swap._id),
      });
      if (existingBonus) continue;

      await Transaction.createAndComplete({
        userId: uid,
        type: 'BONUS',
        points_amount: SWAP_REWARD,
        description: `Skill swap reward for swap ${swap._id}`,
        metadata: { skillSwapRequestId: swap._id },
        balance_after: null,
      });

      try {
        await Wallet.creditPoints(uid, SWAP_REWARD);
      } catch (err) {
        console.warn('Failed to credit wallet for user', uid, err);
      }

      try {
        await User.findByIdAndUpdate(uid, { $inc: { pointsBalance: SWAP_REWARD } });
      } catch (err) {
        console.warn('Failed to update User.pointsBalance for', uid, err);
      }
    }
  } catch (err) {
    console.warn('Failed to apply swap rewards', err);
  }

  // ✅ Notify requester + receiver
  await Notification.create({
    user: swap.fromUser,
    type: 'skill_swap_response',
    title: 'Skill Swap Accepted',
    message: 'Your skill swap request was accepted. You are now enrolled.',
    data: { skillSwapRequestId: swap._id, status: 'accepted' },
  });

  await Notification.create({
    user: swap.toUser,
    type: 'skill_swap_response',
    title: 'Skill Swap Completed',
    message: 'You accepted the skill swap request. You are now enrolled.',
    data: { skillSwapRequestId: swap._id, status: 'accepted' },
  });

  res.status(StatusCodes.OK).json({ success: true, message: 'Accepted', swap });
};
