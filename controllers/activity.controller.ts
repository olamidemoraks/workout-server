import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import activityModel from "../models/activity";
import workoutModel from "../models/workout.model";

export const createActivity = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    req.body.userId = req.user?._id;
    try {
      const { userId, workoutId, totalTime } = req.body;

      if (!userId && !workoutId) {
        return next(new ErrorHandler("Invalid information", 400));
      }
      if (totalTime < 1) {
        return next(new ErrorHandler("total time less than 1 sec", 400));
      }
      const workout = await workoutModel.findById(workoutId);
      const data = {
        userId,
        workoutName: workout?.focus_point,
        totalTime,
      };
      const activity = await activityModel.create(data);
      res.status(201).json({ success: true, activity });
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
        currentDate.getMonth() + 1 - currentDate.getMonth(),
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
