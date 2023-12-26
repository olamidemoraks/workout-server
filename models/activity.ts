import mongoose, { Schema, Document, Model, model } from "mongoose";

interface IActivity extends Document {
  userId: string;
  workoutName: string;
  totalTime: number;
  createdAt: Date;
}

const activitySchema = new Schema<IActivity>(
  {
    userId: {
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
  },
  { timestamps: true }
);

const activityModel: Model<IActivity> = model("Activity", activitySchema);

export default activityModel;
