import mongoose, { Document, Model, Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const emailRegexPattern: RegExp = /^[^\$@]+@[^\$@]+\.[^\$@]+$/;

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  username: string;
  age: Date;
  gender: string;
  height: string;
  weight: string;
  avatar: {
    public_id: string;
    url: string;
  };
  weightHistory: {
    weight: number;
    createdAt: Date;
  }[];
  goals: string;
  isVerified: boolean;
  role: string;
  level: number;
  steps: string;
  weightMeasure: string;
  heightMeasure: string;
  followers: string[];
  following: string[];
  challengePin: string[];
  streakApperanceType: number;
  comparePassword: (password: string) => Promise<boolean>;
  SignAccessToken: () => string;
  SignRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new mongoose.Schema(
  {
    name: { type: String },
    email: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: function (value: string) {
          return emailRegexPattern.test(value);
        },
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      minlength: [6, "Password is to short"],
      select: false,
    },
    username: {
      type: String,
      unique: true,
    },
    age: {
      type: Date,
    },
    gender: {
      enum: ["male", "female"],
      type: String,
    },
    goals: {
      type: String,
    },
    height: {
      type: String,
    },
    weight: {
      type: String,
    },
    weightHistory: [
      {
        weight: Number,
        createdAt: Date,
      },
    ],
    role: {
      type: String,
      default: "user",
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    avatar: {
      public_id: String,
      url: String,
    },
    steps: {
      type: String,
      default: "gender",
      // start, gender, age, weight, level, done
    },
    level: {
      type: Number,
    },
    weightMeasure: {
      type: String,
      enum: ["kg", "lg"],
    },
    heightMeasure: {
      type: String,
      enum: ["cm", "ft"],
    },
    followers: {
      type: [String],
    },
    following: {
      type: [String],
    },
    challengePin: {
      type: [String],
    },
    streakApperanceType: {
      type: Number,
      default: 1,
    },
  },
  { timestamps: true }
);

//sign access token
userSchema.methods.SignAccessToken = function () {
  return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN as string, {
    expiresIn: "21d",
  });
};
//sign refresh token
userSchema.methods.SignRefreshToken = function () {
  return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN as string, {
    expiresIn: "3d",
  });
};

userSchema.methods.comparePassword = async function (
  enterPassword: string
): Promise<boolean> {
  return await bcrypt.compare(enterPassword, this.password || "@__");
};

userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const userModel: Model<IUser> = mongoose.model("User", userSchema);

export default userModel;
