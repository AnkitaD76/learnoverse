import { StatusCodes } from 'http-status-codes';
import { Course, Enrollment, Notification, SkillSwapRequest, User, Wallet, Transaction } from '../models/index.js';
import { BadRequestError, NotFoundError, UnauthorizedError } from '../errors/index.js';

export const requestSkillSwap = async (req, res) => {
  const fromUserId = req.user.userId;
  const { toUserId, offeredCourseId, requestedCourseId } = req.body;

  if (!toUserId || !offeredCourseId || !requestedCourseId) {
    throw new BadRequestError('toUserId, offeredCourseId, requestedCourseId required');
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

  // requested course must exist
  const requestedCourse = await Course.findById(requestedCourseId);
  if (!requestedCourse) throw new NotFoundError('Requested course not found');

  // ✅ only ONE pending request per requester
  const existingPending = await SkillSwapRequest.findOne({ fromUser: fromUserId, status: 'pending' });
  if (existingPending) throw new BadRequestError('You already have a pending skill swap request');

  const swap = await SkillSwapRequest.create({
    fromUser: fromUserId,
    toUser: toUserId,
    offeredCourse: offeredCourseId,
    requestedCourse: requestedCourseId,
    status: 'pending',
  });

  // Include requester info and list of their created courses in the notification
  const fromUser = await User.findById(fromUserId).select('name email');
  const createdCourses = await Course.find({ instructor: fromUserId }).select('title');
  const createdCoursesPayload = createdCourses.map(c => ({ id: c._id, title: c.title }));

  await Notification.create({
    user: toUserId,
    type: 'skill_swap_request',
    title: 'New Skill Swap Request',
    message: `${fromUser?.name || 'A user'} requested a skill swap offering "${offeredCourse.title}". Select a course to accept or reject.`,
    data: {
      skillSwapRequestId: swap._id,
      fromUser: fromUserId,
      offeredCourseId,
      fromUserCourses: createdCoursesPayload,
    },
  });

  res.status(StatusCodes.CREATED).json({ success: true, message: 'Skill swap request sent', swap });
};

export const respondSkillSwap = async (req, res) => {
  const toUserId = req.user.userId;
  const { action, acceptedOfferedCourseId } = req.body; // "accept" or "reject" + optional chosen offered course id

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

  // If receiver specified a particular offered course, validate and use it
  let offeredToEnroll = swap.offeredCourse;
  if (acceptedOfferedCourseId) {
    const chosen = await Course.findById(acceptedOfferedCourseId);
    if (!chosen) throw new NotFoundError('Chosen offered course not found');
    // ensure chosen course belongs to requester
    if (String(chosen.instructor) !== String(swap.fromUser)) {
      throw new UnauthorizedError('Chosen offered course does not belong to the requester');
    }
    offeredToEnroll = acceptedOfferedCourseId;
    // update swap record to reflect the chosen offered course
    swap.offeredCourse = acceptedOfferedCourseId;
  }

  // ✅ accept: enroll receiver into offered course, and requester into requested course
  swap.status = 'accepted';
  await swap.save();

  // enroll "toUser" into offeredToEnroll
  const e1 = await Enrollment.findOne({ user: swap.toUser, course: offeredToEnroll });
  if (!e1 || e1.status !== 'enrolled') {
    await Enrollment.findOneAndUpdate(
      { user: swap.toUser, course: offeredToEnroll },
      { status: 'enrolled' },
      { upsert: true, new: true }
    );
    // increment course enrollCount when a new enrolled record is created via swap
    try {
      await Course.findByIdAndUpdate(offeredToEnroll, { $inc: { enrollCount: 1 } });
    } catch (err) {
      // non-fatal: log and continue
      console.warn('Failed to increment enrollCount for offeredCourse', err);
    }
  }

  // ensure requester enrolled in requestedCourse (often already enrolled, but keep safe)
  const e2 = await Enrollment.findOne({ user: swap.fromUser, course: swap.requestedCourse });
  if (!e2 || e2.status !== 'enrolled') {
    await Enrollment.findOneAndUpdate(
      { user: swap.fromUser, course: swap.requestedCourse },
      { status: 'enrolled' },
      { upsert: true, new: true }
    );
    // increment course enrollCount when requester is newly enrolled via swap
    try {
      await Course.findByIdAndUpdate(swap.requestedCourse, { $inc: { enrollCount: 1 } });
    } catch (err) {
      console.warn('Failed to increment enrollCount for requestedCourse', err);
    }
  }

  // Reward points to both users for completing a skill swap
  try {
    const SWAP_REWARD = 10; // default reward points per user; adjust if needed
    const parties = [String(swap.fromUser), String(swap.toUser)];

    for (const uid of parties) {
      // idempotency: ensure we haven't already created a bonus tx for this swap and user
      const existingBonus = await Transaction.findOne({
        userId: uid,
        type: 'BONUS',
        'metadata.skillSwapRequestId': String(swap._id),
      });
      if (existingBonus) continue;

      // create completed bonus transaction
      await Transaction.createAndComplete({
        userId: uid,
        type: 'BONUS',
        points_amount: SWAP_REWARD,
        description: `Skill swap reward for swap ${swap._id}`,
        metadata: { skillSwapRequestId: swap._id },
        balance_after: null,
      });

      // credit the wallet
      try {
        await Wallet.creditPoints(uid, SWAP_REWARD);
      } catch (err) {
        console.warn('Failed to credit wallet for user', uid, err);
      }

      // update user.pointsBalance for dashboard convenience
      try {
        await User.findByIdAndUpdate(uid, { $inc: { pointsBalance: SWAP_REWARD } });
      } catch (err) {
        console.warn('Failed to update User.pointsBalance for', uid, err);
      }
    }
  } catch (err) {
    console.warn('Failed to apply swap rewards', err);
  }

  await Notification.create({
    user: swap.fromUser,
    type: 'skill_swap_response',
    title: 'Skill Swap Accepted',
    message: 'Your skill swap request was accepted.',
    data: { skillSwapRequestId: swap._id, status: 'accepted' },
  });

  await Notification.create({
    user: swap.toUser,
    type: 'skill_swap_response',
    title: 'Skill Swap Accepted',
    message: 'You accepted the skill swap request.',
    data: { skillSwapRequestId: swap._id, status: 'accepted' },
  });

  res.status(StatusCodes.OK).json({ success: true, message: 'Accepted', swap });
};
