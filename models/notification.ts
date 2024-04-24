import mongoose, { Document, Schema, Model, model } from "mongoose";

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  from: mongoose.Types.ObjectId;
  type: string;
  workoutId: string;
  content: string;
  status: "read" | "unread";
}

const notificationSchema: Schema<INotification> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  workoutId: String,
  type: { type: String, required: true },
  content: String,
  status: {
    type: String,
    default: "unread",
    enum: ["read", "unread"],
  },
});

export const notificationModel: Model<INotification> = model(
  "Notification",
  notificationSchema
);
