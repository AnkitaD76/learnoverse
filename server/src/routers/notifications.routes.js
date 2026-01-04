import express from "express";
import { StatusCodes } from "http-status-codes";
import { authenticate, requireVerification } from "../middleware/authenticate.js";
import { Notification } from "../models/index.js";

const router = express.Router();

// GET /api/v1/notifications
router.get("/", authenticate, requireVerification, async (req, res) => {
  const userId = req.user.userId;

  const notifications = await Notification.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(100);

  return res.status(StatusCodes.OK).json({
    success: true,
    notifications,
  });
});

// PATCH /api/v1/notifications/:id/read
router.patch("/:id/read", authenticate, requireVerification, async (req, res) => {
  const userId = req.user.userId;

  const notif = await Notification.findOneAndUpdate(
    { _id: req.params.id, user: userId },
    { readAt: new Date() },
    { new: true }
  );

  if (!notif) {
    return res.status(StatusCodes.NOT_FOUND).json({
      success: false,
      message: "Notification not found",
    });
  }

  return res.status(StatusCodes.OK).json({
    success: true,
    notif,
  });
});

// PATCH /api/v1/notifications/read-all
router.patch("/read-all", authenticate, requireVerification, async (req, res) => {
  const userId = req.user.userId;

  await Notification.updateMany(
    { user: userId, readAt: null },
    { readAt: new Date() }
  );

  return res.status(StatusCodes.OK).json({
    success: true,
    message: "All notifications marked as read",
  });
});

export default router;
