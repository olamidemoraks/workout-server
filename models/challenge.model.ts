import mongoose, { Schema, model, Model, Document } from "mongoose";
import { IExercise, exerciseSchema } from "./workout.model";

export interface IChallenge extends Document {
  title: string;
  days: number;
  image: {
    public_id: string;
    url: string;
  };
  premium: boolean;
  location: string;
  challenges: IExercise[][];
}

// interface IWorkoutChallenge extends Document {
//   exercises: IExercise[];
// }

// const workoutChallenge = new Schema<IWorkoutChallenge>({
//   exercises: [exerciseSchema],
// });

const challengeSchema = new Schema<IChallenge>(
  {
    title: {
      required: true,
      type: String,
    },
    premium: {
      default: false,
      type: Boolean,
    },
    days: Number,
    image: {
      public_id: String,
      url: String,
    },
    location: {
      enum: ["gym", "home", "anywhere"],
      default: "home",
      type: String,
    },
    challenges: [[exerciseSchema]],
  },
  { timestamps: true }
);

const challengeModel: Model<IChallenge> = model("Challenge", challengeSchema);

export default challengeModel;
