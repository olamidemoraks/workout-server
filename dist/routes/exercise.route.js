"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const exercise_controller_1 = require("../controllers/exercise.controller");
const auth_1 = require("../middlewares/auth");
const exerciseRoute = express_1.default.Router();
exerciseRoute.post("/create-exercise", auth_1.authorizeUser, (0, auth_1.authorizeRoles)("admin"), exercise_controller_1.createExercise);
exerciseRoute.put("/update-exercise/:id", auth_1.authorizeUser, (0, auth_1.authorizeRoles)("admin"), exercise_controller_1.updateExercise);
exerciseRoute.delete("/delete-exercise/:id", auth_1.authorizeUser, (0, auth_1.authorizeRoles)("admin"), exercise_controller_1.deleteExercise);
exerciseRoute.get("/get-exercises", exercise_controller_1.getExercises);
exerciseRoute.get("/get-exercise/:id", exercise_controller_1.getExercise);
exports.default = exerciseRoute;
//# sourceMappingURL=exercise.route.js.map