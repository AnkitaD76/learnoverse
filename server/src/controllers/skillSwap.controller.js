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

// ✅ enroll or re-enroll safely + update enrollCount only when needed
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

// ✅ create notification in a compatible way (data + metadata)
const createNotification = async ({ user, type, title, message, payload }) => {
  return Notification.create({
    user,
    type,
    title,
    message,
    data: payload || {},
    metadata: payload || {}, // ✅ for older schema compatibility
    readAt: null,
    read: false,
  });
};

export const requestSkillSwap = async (req, res) => {
  const fromUserId = req.user.userId;
  const { offeredCourseId, requestedCourseId } = req.body;

  if (!offeredCourseId || !requestedCourseId) {
    throw new BadRequestError('offeredCourseId and requestedCourseId required');
  }

  // ✅ must have created at least 1 course
  const createdCount = await Course.countDocuments({ instructor: fromUserId });
  if (createdCount < 1) {
    throw new BadRequestError('You must create at least one course before requesting a skill swap');
  }

  // ✅ offered course must exist and belong to requester
  const offeredCourse = await Course.findById(offeredCourseId);
  if (!offeredCourse) throw new NotFoundError('Offered course not found');

  if (String(offeredCourse.instructor) !== String(fromUserId)) {
    throw new UnauthorizedError('You can only offer your own course');
  }

  if (!offeredCourse.isPublished) {
    throw new BadRequestError('Your offered course must be published to request a skill swap');
  }

  // ✅ requested course must exist, published, and skillSwapEnabled
  const requestedCourse = await Course.findById(requestedCourseId);
  if (!requestedCourse) throw new NotFoundError('Requested course not found');

  if (!requestedCourse.isPublished) {
    throw new BadRequestError('Requested course is not published');
  }
  if (!requestedCourse.skillSwapEnabled) {
    throw new BadRequestError('Skill swap is not enabled for this course');
  }

  // ✅ auto-detect course owner (ignore client toUserId)
  const toUserId = requestedCourse.instructor;

  if (String(toUserId) === String(fromUserId)) {
    throw new BadRequestError("You can't request a skill swap on your own course");
  }

  // ✅ IMPORTANT FIX:
  // only block DUPLICATE pending request for SAME requestedCourse (not global).
  // If there is already a pending request for this requestedCourse, update it.
  let swap = await SkillSwapRequest.findOne({
    fromUser: fromUserId,
    toUser: toUserId,
    requestedCourse: requestedCourseId,
    status: 'pending',
  });

  // requester info + published courses list for notification UI
  const fromUser = await User.findById(fromUserId).select('name email');
  const publishedOfferedCourses = await Course.find({
    instructor: fromUserId,
    isPublished: true,
  }).select('title');
  const fromUserCoursesPayload = publishedOfferedCourses.map(c => ({
    id: c._id,
    title: c.title,
  }));

  if (swap) {
    // ✅ update the offered course (so requester can change the offer)
    swap.offeredCourse = offeredCourseId;
    await swap.save();

    // ✅ Re-notify (but avoid spamming if an unread notif already exists)
    const existingNotif = await Notification.findOne({
      user: toUserId,
      type: 'skill_swap_request',
      $or: [
        { 'data.skillSwapRequestId': String(swap._id) },
        { 'metadata.skillSwapRequestId': String(swap._id) },
      ],
    });

    const isUnread =
      existingNotif && !(existingNotif.readAt || existingNotif.read === true);

    if (!isUnread) {
      await createNotification({
        user: toUserId,
        type: 'skill_swap_request',
        title: 'Skill Swap Request (Updated)',
        message: `${fromUser?.name || 'A user'} updated their skill swap offer: "${offeredCourse.title}".`,
        payload: {
          skillSwapRequestId: swap._id,
          fromUser: fromUserId,
          offeredCourseId,
          requestedCourseId,
          fromUserCourses: fromUserCoursesPayload,
        },
      });
    }

    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'You already had a pending request for this course. Offer updated and course creator notified.',
      swap,
    });
  }

  // ✅ create new swap request
  swap = await SkillSwapRequest.create({
    fromUser: fromUserId,
    toUser: toUserId,
    offeredCourse: offeredCourseId,
    requestedCourse: requestedCourseId,
    status: 'pending',
  });

  await createNotification({
    user: toUserId,
    type: 'skill_swap_request',
    title: 'New Skill Swap Request',
    message: `${fromUser?.name || 'A user'} requested a skill swap offering "${offeredCourse.title}".`,
    payload: {
      skillSwapRequestId: swap._id,
      fromUser: fromUserId,
      offeredCourseId,
      requestedCourseId,
      fromUserCourses: fromUserCoursesPayload,
    },
  });

  return res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Skill swap request sent',
    swap,
  });
};

export const respondSkillSwap = async (req, res) => {
  const toUserId = req.user.userId;
  const { action, acceptedOfferedCourseId } = req.body; // accept/reject + optional chosen course id

  const swap = await SkillSwapRequest.findById(req.params.id);
  if (!swap) throw new NotFoundError('Skill swap request not found');

  if (String(swap.toUser) !== String(toUserId)) {
    throw new UnauthorizedError('Not allowed');
  }

  if (swap.status !== 'pending') {
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'Already handled',
      swap,
    });
  }

  if (action !== 'accept' && action !== 'reject') {
    throw new BadRequestError('action must be accept or reject');
  }

  // ✅ Reject
  if (action === 'reject') {
    swap.status = 'rejected';
    await swap.save();

    await createNotification({
      user: swap.fromUser,
      type: 'skill_swap_response',
      title: 'Skill Swap Rejected',
      message: 'Your skill swap request was rejected.',
      payload: { skillSwapRequestId: swap._id, status: 'rejected' },
    });

    return res.status(StatusCodes.OK).json({ success: true, message: 'Rejected', swap });
  }

  // ✅ Accept
  let offeredCourseIdToUse = swap.offeredCourse;

  // If your UI lets creator choose among requester courses (optional)
  if (acceptedOfferedCourseId) {
    const chosen = await Course.findById(acceptedOfferedCourseId);
    if (!chosen) throw new NotFoundError('Chosen offered course not found');

    if (String(chosen.instructor) !== String(swap.fromUser)) {
      throw new UnauthorizedError('Chosen offered course does not belong to requester');
    }

    if (!chosen.isPublished) {
      throw new BadRequestError('Chosen offered course must be published');
    }

    offeredCourseIdToUse = acceptedOfferedCourseId;
    swap.offeredCourse = acceptedOfferedCourseId;
  }

  const offeredCourse = await Course.findById(offeredCourseIdToUse);
  if (!offeredCourse) throw new NotFoundError('Offered course not found');
  if (!offeredCourse.isPublished) throw new BadRequestError('Offered course is not published');

  const requestedCourse = await Course.findById(swap.requestedCourse);
  if (!requestedCourse) throw new NotFoundError('Requested course not found');
  if (!requestedCourse.isPublished) throw new BadRequestError('Requested course is not published');
  if (!requestedCourse.skillSwapEnabled) {
    throw new BadRequestError('Requested course is no longer eligible for skill swap');
  }

  // ✅ enroll BOTH
  await enrollOrReEnroll(swap.toUser, offeredCourseIdToUse);
  await enrollOrReEnroll(swap.fromUser, swap.requestedCourse);

  swap.status = 'accepted';
  await swap.save();

  // ✅ rewards (won’t break enrollment if fails)
  try {
    const SWAP_REWARD = 10;
    const parties = [String(swap.fromUser), String(swap.toUser)];

    for (const uid of parties) {
      if (Transaction?.findOne) {
        const existingBonus = await Transaction.findOne({
          userId: uid,
          type: 'BONUS',
          'metadata.skillSwapRequestId': String(swap._id),
        });
        if (existingBonus) continue;
      }

      if (Transaction?.createAndComplete) {
        await Transaction.createAndComplete({
          userId: uid,
          type: 'BONUS',
          points_amount: SWAP_REWARD,
          description: `Skill swap reward for swap ${swap._id}`,
          metadata: { skillSwapRequestId: swap._id },
          balance_after: null,
        });
      }

      if (Wallet?.creditPoints) await Wallet.creditPoints(uid, SWAP_REWARD);
      await User.findByIdAndUpdate(uid, { $inc: { pointsBalance: SWAP_REWARD } });
    }
  } catch (err) {
    console.warn('Swap reward failed (ignored):', err);
  }

  await createNotification({
    user: swap.fromUser,
    type: 'skill_swap_response',
    title: 'Skill Swap Accepted',
    message: 'Your skill swap request was accepted. You are now enrolled in both courses.',
    payload: { skillSwapRequestId: swap._id, status: 'accepted' },
  });

  await createNotification({
    user: swap.toUser,
    type: 'skill_swap_response',
    title: 'Skill Swap Completed',
    message: 'You accepted the skill swap request. You are now enrolled in both courses.',
    payload: { skillSwapRequestId: swap._id, status: 'accepted' },
  });

  return res.status(StatusCodes.OK).json({
    success: true,
    message: 'Accepted. Both users enrolled.',
    swap,
  });
};
