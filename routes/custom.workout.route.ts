import express from "express";

import { authorizeRoles, authorizeUser } from "../middlewares/auth";
import {
  createCustomWorkout,
  deleteCustomWorkout,
  getCustomWorkoutById,
  getInvitedUserFromCustomWorkout,
  getUserCustomWorkouts,
  inviteFriend,
  inviteResponse,
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
customWorkoutRoute.put(
  "/custom-workout-invite/:id",
  authorizeUser,
  inviteFriend
);
customWorkoutRoute.put(
  "/custom-workout-invite-response/:id",
  authorizeUser,
  inviteResponse
);
customWorkoutRoute.get(
  "/get-invited-users/:id",
  authorizeUser,
  getInvitedUserFromCustomWorkout
);
customWorkoutRoute.delete(
  "/delete-custom-workout/:id",
  authorizeUser,
  deleteCustomWorkout
);
customWorkoutRoute.get("/get-all-user-workouts/:userId", getUserCustomWorkouts);
customWorkoutRoute.get(
  "/get-custom-workout/:id",
  authorizeUser,
  getCustomWorkoutById
);

export default customWorkoutRoute;
