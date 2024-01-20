import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import customWorkoutModel from "../models/customWorkout.model";
import exerciseModel from "../models/exercise.model";

export const createCustomWorkout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { female_image, image, exercises } = req.body;
      req.body.creatorId = req.user?._id;
      if (exercises.length === 0) {
        return next(new ErrorHandler("Please add exercises to workout", 400));
      }
      if (female_image) {
        const myCloud = await cloudinary.v2.uploader.upload(female_image, {
          folder: "workout_female_image",
        });
        req.body.female_image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      if (image) {
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "workout_image",
        });
        req.body.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      const workout = await customWorkoutModel.create(req.body);

      res.status(201).json({
        success: true,
        message: "Workout created",
        workout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getUserCustomWorkouts = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.userId;
      const workouts = await customWorkoutModel.find({ creatorId: userId });
      res.status(200).json({ success: true, workouts });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updateCustomWorkout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { image, exercises } = req.body;

      if (exercises.length === 0) {
        return next(new ErrorHandler("Please add exercises to workout", 400));
      }

      const workout = await customWorkoutModel.findById(id);

      if (!workout) {
        return next(new ErrorHandler("Workout doesn't exist", 404));
      }

      if (workout?.creatorId !== req.user?._id) {
        return next(new ErrorHandler("Can't delete another user workout", 404));
      }

      if (typeof image === "string") {
        await cloudinary.v2.uploader.destroy(workout.image.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "workout_image",
        });
        req.body.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const updatedWorkout = await customWorkoutModel.findByIdAndUpdate(
        { _id: id },
        req.body,
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Workout Updated",
        workout: updatedWorkout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getCustomWorkoutById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      const workout = await customWorkoutModel.findById(id);
      const exercises = await Promise.all(
        workout!.exercises.map(async (value: any) => {
          const exercise = await exerciseModel.findOne({
            _id: value.exercise_id,
          });
          console.log(exercise);
          return {
            ...(exercise as any)?._doc,
            ...(value as any)?._doc,
          };
        })
      );

      const workoutWithExercise = {
        ...(workout as any)?._doc,
        exercises,
      };

      res.status(200).json({ success: true, workout: workoutWithExercise });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const deleteCustomWorkout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const workout = await customWorkoutModel.findById(id);

      if (!workout) {
        return next(new ErrorHandler("Workout doesn't exist", 404));
      }
      if (workout?.creatorId !== req.user?._id) {
        return next(new ErrorHandler("Can't delete another user workout", 404));
      }

      await cloudinary.v2.uploader.destroy(workout.image.public_id);

      await customWorkoutModel.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Workout deleted",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
