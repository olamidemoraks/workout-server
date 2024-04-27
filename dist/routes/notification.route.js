"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middlewares/auth");
const notification_controller_1 = require("../controllers/notification.controller");
const notificationRouter = express_1.default.Router();
notificationRouter.get("/notification", auth_1.authorizeUser, notification_controller_1.getUnreadNotifcation);
notificationRouter.put("/notification/:id", auth_1.authorizeUser, notification_controller_1.updateNotification);
exports.default = notificationRouter;
//# sourceMappingURL=notification.route.js.map