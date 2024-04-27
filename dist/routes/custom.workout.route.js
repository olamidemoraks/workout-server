"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const customWorkout_controller_1 = require("../controllers/customWorkout.controller");
const customWorkoutRoute = express_1.default.Router();
customWorkoutRoute.post("/create-custom-workouts", auth_1.authorizeUser, customWorkout_controller_1.createCustomWorkout);
customWorkoutRoute.put("/update-custom-workout/:id", auth_1.authorizeUser, customWorkout_controller_1.updateCustomWorkout);
customWorkoutRoute.put("/custom-workout-invite/:id", auth_1.authorizeUser, customWorkout_controller_1.inviteFriend);
customWorkoutRoute.put("/custom-workout-invite-response/:id", auth_1.authorizeUser, customWorkout_controller_1.inviteResponse);
customWorkoutRoute.get("/get-invited-users/:id", auth_1.authorizeUser, customWorkout_controller_1.getInvitedUserFromCustomWorkout);
customWorkoutRoute.delete("/delete-custom-workout/:id", auth_1.authorizeUser, customWorkout_controller_1.deleteCustomWorkout);
customWorkoutRoute.get("/get-all-user-workouts/:userId", customWorkout_controller_1.getUserCustomWorkouts);
customWorkoutRoute.get("/get-custom-workout/:id", auth_1.authorizeUser, customWorkout_controller_1.getCustomWorkoutById);
exports.default = customWorkoutRoute;
//# sourceMappingURL=custom.workout.route.js.map