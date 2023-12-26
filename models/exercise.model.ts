import mongoose, { Schema, model, Document, Model } from "mongoose";

interface IExercise extends Document {
  name: string;
  image: {
    public_id: string;
    url: string;
  };
  female_image: {
    public_id: string;
    url: string;
  };
  instruction_video: {
    public_id: string;
    url: string;
  };
  tips: string;
  body_part: string;
  equipment: string;
  location: string;
  focus: string;
}

const exerciseSchema: Schema<IExercise> = new mongoose.Schema(
  {
    name: String,
    image: {
      public_id: String,
      url: String,
    },
    female_image: {
      public_id: String,
      url: String,
    },
    instruction_video: {
      public_id: String,
      url: String,
    },
    tips: String,
    body_part: String,
    equipment: String,
    location: {
      enum: ["gym", "home"],
      default: "home",
      type: String,
    },
    focus: String,
  },
  { timestamps: true }
);

const exerciseModel: Model<IExercise> = mongoose.model(
  "Exercise",
  exerciseSchema
);

export default exerciseModel;
