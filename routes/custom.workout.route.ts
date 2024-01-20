import express from "express";

import { authorizeRoles, authorizeUser } from "../middlewares/auth";
import {
  createCustomWorkout,
  deleteCustomWorkout,
  getCustomWorkoutById,
  getUserCustomWorkouts,
  updateCustomWorkout,
} from "../controllers/customWorkout.controller";

const customWorkoutRoute = express.Router();

customWorkoutRoute.post(
  "/create-custom-workouts",
  authorizeUser,
  createCustomWorkout
);
customWorkoutRoute.put(
  "/update-custom-workout/:id",
  authorizeUser,
  updateCustomWorkout
);
customWorkoutRoute.delete(
  "/delete-custom-workout/:id",
  authorizeUser,
  deleteCustomWorkout
);
customWorkoutRoute.get("/get-all-user-workouts/:userId", getUserCustomWorkouts);
customWorkoutRoute.get("/get-custom-workout/:id", getCustomWorkoutById);

export default customWorkoutRoute;
