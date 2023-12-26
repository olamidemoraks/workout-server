import express from "express";
import {
  completedChallenge,
  createChallenges,
  deleteChallenges,
  getAllChallenges,
  getChallenge,
  getChallengeInfo,
  getCurrentChallenge,
  getFrontalChallenge,
  startChallenge,
  updateChallenges,
} from "../controllers/challenge.controller";
import { authorizeUser } from "../middlewares/auth";
const challengeRoute = express.Router();

challengeRoute.post("/create-challenge", createChallenges);
challengeRoute.get("/get-challenges", getAllChallenges);
challengeRoute.put("/update-challenge/:id", updateChallenges);
challengeRoute.get("/get-challenge/:id", getChallenge);
challengeRoute.delete("/delete-challenge/:id", deleteChallenges);

challengeRoute.post("/completed-challenge", authorizeUser, completedChallenge);
challengeRoute.get("/get-challenge-info/:id", authorizeUser, getChallengeInfo);
challengeRoute.get("/frontal-challenges", authorizeUser, getFrontalChallenge);
challengeRoute.get("/current-challenges", authorizeUser, getCurrentChallenge);
challengeRoute.get("/start-challenges/:id", startChallenge);

export default challengeRoute;
