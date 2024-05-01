import { Schema, Model, Document, model } from "mongoose";
import { IChallenge } from "./challenge.model";

interface IChallengeProgress extends Document {
  challengeId: string;
  userId: string;
  day: number;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  isFinished: boolean;
  challenge: IChallenge;
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
    isFinished: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

challengeProgress.virtual("challenge", {
  ref: "Challenge",
  localField: "challengeId",
  foreignField: "_id",
  justOne: true,
});

challengeProgress.set("toObject", { virtuals: true });
challengeProgress.set("toJSON", { virtuals: true });

const challengeProgressModel: Model<IChallengeProgress> = model(
  "ChallengeProgress",
  challengeProgress
);

export default challengeProgressModel;
