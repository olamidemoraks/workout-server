import express from "express";
import {
  getAllWorkout,
  createWorkout,
  deleteWorkout,
  updateWorkout,
  getWorkout,
  getFreemiumWorkout,
} from "../controllers/workout.controller";
import { authorizeRoles, authorizeUser } from "../middlewares/auth";

const workoutRoute = express.Router();

workoutRoute.post(
  "/create-workout",
  // authorizeUser,
  // authorizeRoles("admin"),
  createWorkout
);
workoutRoute.put(
  "/update-workout/:id",
  // authorizeUser,
  // authorizeRoles("admin"),
  updateWorkout
);
workoutRoute.delete(
  "/delete-workout/:id",
  // authorizeUser,
  // authorizeRoles("admin"),
  deleteWorkout
);
workoutRoute.get(
  "/get-all-workouts",
  // authorizeUser,
  // authorizeRoles("admin"),
  getAllWorkout
);
workoutRoute.get(
  "/get-workout/:id",
  // authorizeUser,
  // authorizeRoles("admin"),
  getWorkout
);

workoutRoute.get("/freemium-workout/:name", getFreemiumWorkout);

export default workoutRoute;
