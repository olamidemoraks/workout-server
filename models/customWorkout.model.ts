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

  userMetrics: Map<string, IMetrics>;
}

export interface IMetrics extends Document {
  userId: string;
  createdAt: Date;
  feedback: string;
  difficulty: number;
}

const metricsSchema = new Schema<IMetrics>({
  userId: String,
  createdAt: Date,
  feedback: {
    type: String,
    default: "alright",
  },
  difficulty: {
    type: Number,
    default: 0,
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

    userMetrics: {
      type: Map,
      of: metricsSchema,
    },
  },
  { timestamps: true }
);

const customWorkoutModel: Model<ICustomWorkout> = model(
  "CustomWorkout",
  customWorkoutSchema
);

export default customWorkoutModel;
