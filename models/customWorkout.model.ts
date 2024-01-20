import mongoose, { Schema, model, Document, Model, Mongoose } from "mongoose";
import { IExercise, exerciseSchema } from "./workout.model";

interface ICustomWorkout extends Document {
  name: string;
  image: {
    public_id: string;
    url: string;
  };
  exercises: IExercise[];
  estimate_time: string;
  location: string;
  creatorId: string;
  metrics: IMetrics[];
}

export interface IMetrics extends Document {
  userId: string;
  createdAt: Date;
  feedback: number;
}

const metricsSchema = new Schema<IMetrics>({
  userId: String,
  createdAt: Date,
  feedback: {
    type: Number,
    default: 2,
  },
});

const customWorkoutSchema: Schema<ICustomWorkout> = new Schema<ICustomWorkout>(
  {
    name: {
      required: true,
      type: String,
    },
    creatorId: {
      required: true,
      type: String,
    },
    image: {
      public_id: String,
      url: String,
    },
    exercises: [exerciseSchema],

    estimate_time: String,
    location: {
      enum: ["gym", "home", "anywhere"],
      default: "home",
      type: String,
    },
    metrics: [metricsSchema],
  },
  { timestamps: true }
);

const customWorkoutModel: Model<ICustomWorkout> = model(
  "CustomWorkout",
  customWorkoutSchema
);

export default customWorkoutModel;
