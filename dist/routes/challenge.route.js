"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const challenge_controller_1 = require("../controllers/challenge.controller");
const auth_1 = require("../middlewares/auth");
const challengeRoute = express_1.default.Router();
challengeRoute.post("/create-challenge", challenge_controller_1.createChallenges);
challengeRoute.get("/get-challenges", challenge_controller_1.getAllChallenges);
challengeRoute.put("/update-challenge/:id", challenge_controller_1.updateChallenges);
challengeRoute.get("/get-challenge/:id", challenge_controller_1.getChallenge);
challengeRoute.delete("/delete-challenge/:id", challenge_controller_1.deleteChallenges);
challengeRoute.post("/completed-challenge", auth_1.authorizeUser, challenge_controller_1.completedChallenge);
challengeRoute.get("/get-challenge-info/:id", auth_1.authorizeUser, challenge_controller_1.getChallengeInfo);
challengeRoute.get("/frontal-challenges", auth_1.authorizeUser, challenge_controller_1.getFrontalChallenge);
challengeRoute.get("/current-challenges", auth_1.authorizeUser, challenge_controller_1.getCurrentChallenge);
challengeRoute.get("/start-challenges/:id", auth_1.authorizeUser, challenge_controller_1.startChallenge);
challengeRoute.put("/pin-challenge", auth_1.authorizeUser, challenge_controller_1.pinChallenge);
exports.default = challengeRoute;
//# sourceMappingURL=challenge.route.js.map