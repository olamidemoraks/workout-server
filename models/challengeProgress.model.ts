import { Schema, Model, Document, model } from "mongoose";

interface IChallengeProgress extends Document {
  challengeId: string;
  userId: string;
  day: number;
  isCompleted: boolean;
  createdAt: Date;
}

const challengeProgress = new Schema<IChallengeProgress>(
  {
    challengeId: {
      required: true,
      type: String,
    },
    userId: {
      required: true,
      type: String,
    },
    day: {
      default: 1,
      type: Number,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const challengeProgressModel: Model<IChallengeProgress> = model(
  "ChallengeProgress",
  challengeProgress
);

export default challengeProgressModel;
