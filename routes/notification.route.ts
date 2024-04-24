import express from "express";
import { authorizeUser } from "../middlewares/auth";
import {
  getUnreadNotifcation,
  updateNotification,
} from "../controllers/notification.controller";

const notificationRouter = express.Router();

notificationRouter.get("/notification", authorizeUser, getUnreadNotifcation);
notificationRouter.put("/notification/:id", authorizeUser, updateNotification);

export default notificationRouter;
