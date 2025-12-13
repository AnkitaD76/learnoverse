import { StatusCodes } from 'http-status-codes';
import { Course, Enrollment, Notification, SkillSwapRequest } from '../models/index.js';
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

  await Notification.create({
    user: toUserId,
    type: 'skill_swap_request',
    title: 'New Skill Swap Request',
    message: 'Someone requested a skill swap. Open to accept or reject.',
    data: { skillSwapRequestId: swap._id },
  });

  res.status(StatusCodes.CREATED).json({ success: true, message: 'Skill swap request sent', swap });
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

  // ✅ accept: enroll receiver into offered course, and requester into requested course
  swap.status = 'accepted';
  await swap.save();

  // enroll "toUser" into offeredCourse
  const e1 = await Enrollment.findOne({ user: swap.toUser, course: swap.offeredCourse });
  if (!e1 || e1.status !== 'enrolled') {
    await Enrollment.findOneAndUpdate(
      { user: swap.toUser, course: swap.offeredCourse },
      { status: 'enrolled' },
      { upsert: true, new: true }
    );
  }

  // ensure requester enrolled in requestedCourse (often already enrolled, but keep safe)
  const e2 = await Enrollment.findOne({ user: swap.fromUser, course: swap.requestedCourse });
  if (!e2 || e2.status !== 'enrolled') {
    await Enrollment.findOneAndUpdate(
      { user: swap.fromUser, course: swap.requestedCourse },
      { status: 'enrolled' },
      { upsert: true, new: true }
    );
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
