import mongoose, { Schema, model, Document, Model, Mongoose } from "mongoose";

export interface IExercise extends Document {
  exercise_id: mongoose.Types.ObjectId;
  time_base: boolean;
  repetition: number;
  rest: number;
}

interface IWorkout extends Document {
  name: string;
  image: {
    public_id: string;
    url: string;
  };
  female_image: {
    public_id: string;
    url: string;
  };
  difficult_level: number;
  exercises: IExercise[];
  premium: boolean;
  description: string;
  estimate_time: string;
  location: string;
  focus_point: string;
}

export const exerciseSchema = new Schema<IExercise>({
  exercise_id: String,
  time_base: Boolean,
  repetition: Number,
  rest: Number,
});

const workoutSchema: Schema<IWorkout> = new mongoose.Schema<IWorkout>(
  {
    name: {
      required: true,
      type: String,
    },
    image: {
      public_id: String,
      url: String,
    },
    female_image: {
      public_id: String,
      url: String,
    },

    exercises: [exerciseSchema],
    description: String,
    difficult_level: {
      enum: [0, 1, 2, 3], //0:None, 1:Beginner, 2:Intermediate, 3:Advanced
      type: Number,
      required: true,
    },
    premium: {
      type: Boolean,
      default: false,
    },
    estimate_time: String,
    location: {
      enum: ["gym", "home", "anywhere"],
      default: "home",
      type: String,
    },
    focus_point: String,
  },
  { timestamps: true }
);

const workoutModel: Model<IWorkout> = model("Workout", workoutSchema);

export default workoutModel;
