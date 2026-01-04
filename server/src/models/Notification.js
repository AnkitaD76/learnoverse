import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    title: { type: String, default: "Notification" },
    message: { type: String, required: true },
    data: { type: Object, default: {} },
    readAt: { type: Date, default: null },
  },
  { timestamps: true }
);

const Notification =
  mongoose.models.Notification || mongoose.model("Notification", notificationSchema);

export default Notification;
