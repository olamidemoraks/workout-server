import e, { Request, Response, NextFunction } from "express";
import { notificationModel } from "../models/notification";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";

export const getUnreadNotifcation = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const notifications = await notificationModel
        .find({
          userId,
          status: "unread",
        })
        .populate({
          path: "from",
          select: "name avatar",
        });

      res.status(200).json({
        success: true,
        notifications,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 405));
    }
  }
);

export const updateNotification = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const notification = await notificationModel.findById(id);

      if (!notification) {
        return next(new ErrorHandler("notfound", 401));
      }
      notification.status = "read";

      await notification?.save();
      res.status(201).json({ success: true });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 405));
    }
  }
);
