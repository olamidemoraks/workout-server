import express from "express";
import { authorizeUser } from "../middlewares/auth";
import {
  createProgram,
  deleteProgram,
  getProgram,
  getPrograms,
  resetProgramProgress,
  updateProgram,
  updateSetProgress,
} from "../controllers/program.controller";

const programRoute = express.Router();

programRoute.get("/get-programs", authorizeUser, getPrograms);
programRoute.get("/get-program/:id", authorizeUser, getProgram);
programRoute.post("/create-program", authorizeUser, createProgram);
programRoute.put("/update-program/:id", authorizeUser, updateProgram);
programRoute.delete("/delete-program/:id", authorizeUser, deleteProgram);
programRoute.put("/program-set-progress/:id", authorizeUser, updateSetProgress);
programRoute.put("/reset-program/:id", authorizeUser, resetProgramProgress);

export default programRoute;
