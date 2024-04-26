require("dotenv").config();
import express, { NextFunction, Request, Response } from "express";
export const app = express();
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import userRouters from "./routes/user.route";
import { ErrorMiddleware } from "./middlewares/error";
import exerciseRoute from "./routes/exercise.route";
import workoutRoute from "./routes/workout.route";
import activityRouter from "./routes/activity.route";
import challengeRoute from "./routes/challenge.route";
import categoryRouter from "./routes/category.route";
import customWorkoutRoute from "./routes/custom.workout.route";
import notificationRoute from "./routes/notification.route";

app.use(express.json({ limit: "50mb" }));

app.use(morgan("common"));
//cookie parser
app.use(cookieParser(process.env.ACCESS_TOKEN));

//cor
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      `${process.env.CLIENT_API}`,
    ],
    credentials: true,
  })
);

app.use(
  "/api/v1",
  userRouters,
  exerciseRoute,
  workoutRoute,
  activityRouter,
  challengeRoute,
  categoryRouter,
  customWorkoutRoute,
  notificationRoute
);

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.status(200).json({
    success: true,
    message: "Api is working",
  });
});

app.all("*", (req: Request, res: Response, next: NextFunction) => {
  const err = new Error(`Route ${req.originalUrl} not found`) as any;
  err.statusCode = 404;
  next(err);
});

app.use(ErrorMiddleware);
