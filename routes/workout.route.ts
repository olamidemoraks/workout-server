import express from "express";
import {
  getAllWorkout,
  createWorkout,
  deleteWorkout,
  updateWorkout,
  getWorkout,
  getWorkoutByCategoryName,
  getAllWorkoutBaseOnEachCategory,
} from "../controllers/workout.controller";
import { authorizeRoles, authorizeUser } from "../middlewares/auth";
import { createCustomWorkout } from "../controllers/customWorkout.controller";

const workoutRoute = express.Router();

workoutRoute.post(
  "/create-workout",
  authorizeUser,
  authorizeRoles("admin"),
  createWorkout
);
workoutRoute.put(
  "/update-workout/:id",
  authorizeUser,
  authorizeRoles("admin"),
  updateWorkout
);
workoutRoute.delete(
  "/delete-workout/:id",
  authorizeUser,
  authorizeRoles("admin"),
  deleteWorkout
);
workoutRoute.get(
  "/get-all-workouts",
  authorizeUser,
  authorizeRoles("admin"),
  getAllWorkout
);
workoutRoute.get("/get-workout/:id", authorizeUser, getWorkout);
workoutRoute.post(
  "/create-custom-workouts",
  authorizeUser,
  createCustomWorkout
);

workoutRoute.get("/freemium-workout/:name", getWorkoutByCategoryName);
workoutRoute.get("/category-workouts", getAllWorkoutBaseOnEachCategory);

export default workoutRoute;
