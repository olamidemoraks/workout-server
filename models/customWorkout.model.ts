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
  invitedUser: Map<string, IinvitedFriend>;
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

interface IinvitedFriend extends Document {
  id: typeof mongoose.Types.ObjectId;
  status: "pending" | "accept" | "reject";
}

const invitedFriendScheme = new Schema<IinvitedFriend>({
  id: { type: mongoose.Types.ObjectId, ref: "User" },
  status: {
    type: String,
    default: "pending",
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
      ref: "User",
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
    invitedUser: {
      type: Map,
      of: invitedFriendScheme,
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
