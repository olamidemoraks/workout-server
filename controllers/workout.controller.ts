import Exercise from "../models/exercise.model";
import Workout from "../models/workout.model";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import { Response, Request, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import Category from "../models/category.model";

export const createWorkout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { female_image, image, exercises } = req.body;

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
      const workout = await Workout.create(req.body);

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

export const updateWorkout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { image, female_image } = req.body;

      const workout = await Workout.findById(id);

      if (!workout) {
        return next(new ErrorHandler("Workout doesn't exist", 404));
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
      if (typeof female_image === "string") {
        await cloudinary.v2.uploader.destroy(workout.female_image.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(female_image, {
          folder: "workout_female_image",
        });
        req.body.female_image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const updatedWorkout = await Workout.findByIdAndUpdate(
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

export const deleteWorkout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const workout = await Workout.findById(id);

      if (!workout) {
        return next(new ErrorHandler("Workout doesn't exist", 404));
      }

      await cloudinary.v2.uploader.destroy(workout.image.public_id);

      await Workout.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Workout deleted",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllWorkout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const workouts = await Workout.find({}).sort("-createdAt");

      res.status(200).json({
        success: true,
        workouts,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const getWorkout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const workout = await Workout.findById(id);

      const exercises = await Promise.all(
        workout!.exercises.map(async (value: any) => {
          const exercise = await Exercise.findOne({ _id: value.exercise_id });
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

      res.status(200).json({
        success: true,
        workout: workoutWithExercise,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getWorkoutByCategoryName = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    const { name } = req.params;
    try {
      const freemiumWorkout = await Workout.find({
        premium: false,
        focus_point: name,
      }).sort("difficult_level");

      res.status(200).json({
        success: true,
        workouts: freemiumWorkout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const getAllWorkoutBaseOnEachCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await Category.find({})
        .sort({ title: 1 })
        .select("_id title");

      const categoryWithWorkout = await Promise.all(
        categories.map(async (category) => {
          const workouts = await Workout.find({
            focus_point: String(category._id),
          })
            .sort("difficult_level")
            .select("image name premium difficult_level");

          const data: { [key: string]: Array<any> } = {};
          data[category.title] = workouts;

          return data;
        })
      );

      res.status(200).json({
        success: true,
        workout: categoryWithWorkout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
