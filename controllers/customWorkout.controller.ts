import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import customWorkoutModel from "../models/customWorkout.model";
import exerciseModel from "../models/exercise.model";
import {
  createNotificationService,
  notificationType,
} from "../service/notification";
import mongoose, { mongo } from "mongoose";

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
      const objectUserId = new mongoose.Types.ObjectId(userId);

      const customWorkout = await customWorkoutModel
        .find({})
        .select("creatorId name image invitedUser")
        .populate({ path: "creator", select: "username name avatar" })
        .sort("-updatedAt");

      const allworkout = await Promise.all(
        customWorkout
          .map((workout) => {
            if (
              workout.creatorId !== userId &&
              workout?.invitedUser?.has(userId)
            ) {
              return workout;
            } else if (workout.creatorId === userId) {
              return workout;
            } else {
              return;
            }
          })
          .filter((workout) => workout !== undefined)
      );

      res.status(200).json({ success: true, workouts: [...allworkout] });
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

      const workout = await customWorkoutModel.findById(id);

      if (!workout) {
        return next(new ErrorHandler("Workout doesn't exist", 404));
      }

      if (exercises.length === 0) {
        return next(new ErrorHandler("Please add exercises to workout", 400));
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

      await customWorkoutModel.findByIdAndUpdate({ _id: id }, req.body, {
        new: true,
      });

      res.status(200).json({
        success: true,
        message: "Workout Updated",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getInvitedUserFromCustomWorkout = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const workout = await customWorkoutModel.findById(id);
      if (!workout) {
        return next(new ErrorHandler("Workout doesn't exist", 404));
      }

      const invitedUser = Array.from(workout?.invitedUser.keys()) ?? [];
      res.status(200).json({ success: true, users: invitedUser });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const inviteFriend = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      const username = req.user?.username;

      const { invitedUser } = req.body as { invitedUser: string[] };

      const workout = await customWorkoutModel.findById(id);

      if (!workout) {
        return next(new ErrorHandler("Workout doesn't exist", 404));
      } else if (!workout.invitedUser) {
        workout.invitedUser = new Map();
      }

      if (userId !== workout?.creatorId) {
        return next(new ErrorHandler("Forbided", 400));
      }

      invitedUser.map((id) => {
        const invite: any = {
          id,
          status: "pending",
        };
        workout.invitedUser.set(id, invite);
      });
      await workout.save();
      await createNotificationService({
        userIds: [...invitedUser],
        from: userId,
        type: notificationType.INVITE_REQUEST,
        content: `${username} invited you to join ${workout.name} ${
          workout.name.toLowerCase().split(" ").includes("workout")
            ? ""
            : "workout"
        }`,
        workoutId: id,
      });
      res.status(200).json({
        success: true,
        message: "Workout Updated",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const inviteResponse = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      if (!userId) {
        return next(new ErrorHandler("User ID is undefined", 400));
      }
      const { id } = req.params;
      const { status } = req.body;
      console.log(`response status ${status}`);
      const workout = await customWorkoutModel.findById(id);

      if (!workout) {
        return next(new ErrorHandler("Workout doesn't exist", 404));
      }

      const inviteResponse: any = {
        id: userId,
        status,
      };
      console.log({ workout, inviteResponse });

      workout.invitedUser.set(userId, inviteResponse);

      await workout.save();

      res.status(200).json({
        success: true,
        message: "user responded to request",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 405));
    }
  }
);

export const getCustomWorkoutById = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const userId = req.user?._id;

      const workout = await customWorkoutModel.findById(id);
      let exercises = await Promise.all(
        workout!.exercises.map(async (value: any) => {
          const exercise = await exerciseModel.findOne({
            _id: value.exercise_id,
          });

          return {
            ...(exercise as any)?._doc,
            ...(value as any)?._doc,
          };
        })
      );
      if (!workout) {
        console.error("workout is undefined");
      } else if (!workout.userMetrics) {
        workout.userMetrics = new Map();
      }
      const difficulty = workout?.userMetrics.get(userId)?.difficulty;

      console.log({ difficulty });

      if (difficulty) {
        exercises = exercises.map((exercise) => {
          return {
            ...exercise,
            repetition: exercise.repetition + difficulty,
          };
        });
      }

      const workoutWithExercise = {
        ...(workout as any)?._doc,
        exercises,
      };

      res.status(200).json({ success: true, workout: workoutWithExercise });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 405));
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
