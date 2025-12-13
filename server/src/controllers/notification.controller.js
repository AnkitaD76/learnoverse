import { StatusCodes } from 'http-status-codes';
import { Notification } from '../models/index.js';

export const getMyNotifications = async (req, res) => {
  const userId = req.user.userId;
  const notifications = await Notification.find({ user: userId }).sort('-createdAt').limit(50);

  res.status(StatusCodes.OK).json({ success: true, notifications });
};

export const markNotificationRead = async (req, res) => {
  const userId = req.user.userId;

  const n = await Notification.findOne({ _id: req.params.id, user: userId });
  if (!n) return res.status(StatusCodes.OK).json({ success: true });

  n.readAt = n.readAt || new Date();
  await n.save();

  res.status(StatusCodes.OK).json({ success: true, notification: n });
};
