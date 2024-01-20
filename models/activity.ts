import mongoose, { Schema, Document, Model, model } from "mongoose";

interface IActivity extends Document {
  userId: string;
  workoutName: string;
  workoutId: string;
  totalTime: number;
  createdAt: Date;
  workoutType: "default" | "challenge" | "customize";
}

const activitySchema = new Schema<IActivity>(
  {
    userId: {
      required: true,
      type: String,
    },
    workoutId: {
      required: true,
      type: String,
    },
    workoutName: {
      required: true,
      type: String,
    },
    totalTime: {
      required: true,
      type: Number,
    },
    workoutType: {
      type: String,
      enum: ["default", "challenge", "customize"],
      default: "challenge",
    },
  },
  { timestamps: true }
);

const activityModel: Model<IActivity> = model("Activity", activitySchema);

export default activityModel;
