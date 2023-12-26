import express from "express";
import {
  createExercise,
  deleteExercise,
  getExercise,
  getExercises,
  updateExercise,
} from "../controllers/exercise.controller";
import { authorizeRoles, authorizeUser } from "../middlewares/auth";

const exerciseRoute = express.Router();

exerciseRoute.post(
  "/create-exercise",
  authorizeUser,
  authorizeRoles("admin"),
  createExercise
);
exerciseRoute.put(
  "/update-exercise/:id",
  authorizeUser,
  authorizeRoles("admin"),
  updateExercise
);
exerciseRoute.delete(
  "/delete-exercise/:id",
  authorizeUser,
  authorizeRoles("admin"),
  deleteExercise
);
exerciseRoute.get("/get-exercises", getExercises);
exerciseRoute.get("/get-exercise/:id", getExercise);

export default exerciseRoute;
