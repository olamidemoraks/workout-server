import express from "express";
import { authorizeUser } from "../middlewares/auth";
import {
  activityYearReport,
  allActivities,
  createActivity,
  recentActivities,
} from "../controllers/activity.controller";

const activityRouter = express.Router();

activityRouter.post("/create-activity", authorizeUser, createActivity);
activityRouter.get("/activity-report", authorizeUser, activityYearReport);
activityRouter.get("/recent-activity", authorizeUser, recentActivities);
activityRouter.get("/all-activity", authorizeUser, allActivities);
// activityRouter.get("/user-streak", authorizeUser, getUserStricks);

export default activityRouter;
