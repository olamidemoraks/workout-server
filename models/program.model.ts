import { Schema, model, Document, Model, Types } from "mongoose";

// A user's own gym program (e.g. "Push day"): a checklist of exercises with
// sets and reps. No images; sets are ticked off during a session.

export interface IProgramExercise {
  _id: Types.ObjectId;
  name: string;
  sets: number;
  // Free text so ranges and timed sets work: "10", "8-12", "30s".
  reps: string;
  // 0-based indexes of the sets ticked on the program's progressDate.
  completedSets: number[];
}

export interface IProgram extends Document {
  userId: string;
  name: string;
  exercises: Types.DocumentArray<IProgramExercise & Document>;
  // The user's local calendar day (YYYY-MM-DD) the ticks belong to. Ticks
  // from any other day are treated as cleared, so each session starts fresh.
  progressDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export const MAX_PROGRAM_EXERCISES = 50;
export const MAX_SETS = 20;

const programExerciseSchema = new Schema<IProgramExercise>({
  name: {
    type: String,
    required: [true, "Every exercise needs a name"],
    trim: true,
    maxlength: [80, "Exercise names can be at most 80 characters"],
  },
  sets: {
    type: Number,
    required: [true, "Every exercise needs a number of sets"],
    min: [1, "An exercise needs at least 1 set"],
    max: [MAX_SETS, `An exercise can have at most ${MAX_SETS} sets`],
    validate: {
      validator: Number.isInteger,
      message: "Sets must be a whole number",
    },
  },
  reps: {
    type: String,
    required: [true, "Every exercise needs reps"],
    trim: true,
    maxlength: [20, "Reps can be at most 20 characters"],
  },
  completedSets: {
    type: [Number],
    default: [],
  },
});

const programSchema = new Schema<IProgram>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Please give your program a name"],
      trim: true,
      maxlength: [60, "Program names can be at most 60 characters"],
    },
    exercises: {
      type: [programExerciseSchema],
      validate: [
        {
          validator: (value: unknown[]) => value.length > 0,
          message: "Add at least one exercise",
        },
        {
          validator: (value: unknown[]) =>
            value.length <= MAX_PROGRAM_EXERCISES,
          message: `A program can have at most ${MAX_PROGRAM_EXERCISES} exercises`,
        },
      ],
    },
    progressDate: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const programModel: Model<IProgram> = model("Program", programSchema);

export default programModel;
