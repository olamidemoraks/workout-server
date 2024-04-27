"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const activity_controller_1 = require("../controllers/activity.controller");
const activityRouter = express_1.default.Router();
activityRouter.post("/create-activity", auth_1.authorizeUser, activity_controller_1.createActivity);
activityRouter.get("/activity-report", auth_1.authorizeUser, activity_controller_1.activityYearReport);
activityRouter.get("/recent-activity", auth_1.authorizeUser, activity_controller_1.recentActivities);
// activityRouter.get("/user-streak", authorizeUser, getUserStricks);
exports.default = activityRouter;
//# sourceMappingURL=activity.route.js.map