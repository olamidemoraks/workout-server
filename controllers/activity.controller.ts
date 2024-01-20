import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import activityModel from "../models/activity";
import workoutModel from "../models/workout.model";
import userModel from "../models/user.model";
import { redis } from "../utils/redis";
import Category from "../models/category.model";
import customWorkoutModel, { IMetrics } from "../models/customWorkout.model";

export const createActivity = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    req.body.userId = req.user?._id;
    try {
      const { userId, workoutId, totalTime, weight, workoutType, feedback } =
        req.body;

      if (!userId && !workoutId) {
        return next(new ErrorHandler("Invalid information", 400));
      }
      if (totalTime < 60) {
        return next(new ErrorHandler("total time less than 1 sec", 400));
      }
      if (req.user?.weight !== weight) {
        const data = {
          weight,
          weightHistory: req.user?.weightHistory,
        };
        data.weightHistory?.push({
          weight: weight,
          createdAt: new Date(),
        });

        const user = await userModel.findByIdAndUpdate(req.user?._id, data, {
          new: true,
        });
        await redis.set(req.user?._id, JSON.stringify(user));
      }

      let data;
      if (workoutType === "default") {
        const workout = await workoutModel.findById(workoutId);
        const category = await Category.findById(workout?.focus_point);
        data = {
          userId,
          workoutId: workout?._id,
          workoutName: category?.title,
          workoutType,
          totalTime,
        };
        await activityModel.create(data);
      } else if (workoutType === "customize") {
        const customizeWorkout = await customWorkoutModel.findById(workoutId);
        data = {
          userId,
          workoutId: customizeWorkout?._id,
          workoutName: customizeWorkout?.name,
          workoutType,
          totalTime,
        };

        const metricsData: any = {
          userId,
          feedback,
          createdAt: new Date(),
        };

        customizeWorkout?.metrics.push(metricsData);

        await Promise.all([
          await activityModel.create(data),
          await customizeWorkout?.save(),
        ]);
      }
      res.status(201).json({ success: true });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

interface IActivity {
  userId: string;
  workoutName: string;
  totalTime: number;
  createdAt: Date;
}

export const activityYearReport = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const currentDate = new Date();
      currentDate.getMonth();
      // set date of tomorrow
      currentDate.setDate(currentDate.getDate() + 1);
      const endDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 10,
        currentDate.getDate()
      );
      const startDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate()
      );

      const monthYear = endDate.toLocaleString("default", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });

      const activities = await activityModel.find({
        userId,
        createdAt: {
          $gte: endDate,
          $lt: startDate,
        },
      });

      const activityReport = await Promise.all(
        activities.reduce((accumulator: any[], currentValue) => {
          const date = currentValue?.createdAt;

          const sameDate: IActivity | null | undefined = accumulator.find(
            (entry: IActivity) =>
              areDatesOnSameDay(new Date(entry?.createdAt), new Date(date))
          );
          if (sameDate) {
            sameDate.totalTime += currentValue.totalTime;
          } else {
            accumulator.push({
              createdAt: date,
              totalTime: currentValue.totalTime,
              workoutName: currentValue.workoutName,
            });
          }

          return accumulator;
        }, [])
      );

      res.status(200).json({
        success: true,
        activityReport,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

function areDatesOnSameDay(date1: Date, date2: Date) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

export const recentActivities = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const activities = await activityModel
        .find({ userId })
        .sort("-createdAt");
      res.status(200).json({
        success: true,
        activities,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
