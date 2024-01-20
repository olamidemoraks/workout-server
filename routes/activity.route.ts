import express from "express";
import { authorizeUser } from "../middlewares/auth";
import {
  activityYearReport,
  createActivity,
  recentActivities,
} from "../controllers/activity.controller";

const activityRouter = express.Router();

activityRouter.post("/create-activity", authorizeUser, createActivity);
activityRouter.get("/activity-report", authorizeUser, activityYearReport);
activityRouter.get("/recent-activity", authorizeUser, recentActivities);
// activityRouter.get("/user-streak", authorizeUser, getUserStricks);

export default activityRouter;
