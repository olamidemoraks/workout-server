"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const workout_controller_1 = require("../controllers/workout.controller");
const auth_1 = require("../middlewares/auth");
const customWorkout_controller_1 = require("../controllers/customWorkout.controller");
const workoutRoute = express_1.default.Router();
workoutRoute.post("/create-workout", auth_1.authorizeUser, (0, auth_1.authorizeRoles)("admin"), workout_controller_1.createWorkout);
workoutRoute.put("/update-workout/:id", auth_1.authorizeUser, (0, auth_1.authorizeRoles)("admin"), workout_controller_1.updateWorkout);
workoutRoute.delete("/delete-workout/:id", auth_1.authorizeUser, (0, auth_1.authorizeRoles)("admin"), workout_controller_1.deleteWorkout);
workoutRoute.get("/get-all-workouts", auth_1.authorizeUser, (0, auth_1.authorizeRoles)("admin"), workout_controller_1.getAllWorkout);
workoutRoute.get("/get-workout/:id", auth_1.authorizeUser, workout_controller_1.getWorkout);
workoutRoute.post("/create-custom-workouts", auth_1.authorizeUser, customWorkout_controller_1.createCustomWorkout);
workoutRoute.get("/freemium-workout/:name", workout_controller_1.getWorkoutByCategoryName);
workoutRoute.get("/category-workouts", workout_controller_1.getAllWorkoutBaseOnEachCategory);
exports.default = workoutRoute;
//# sourceMappingURL=workout.route.js.map