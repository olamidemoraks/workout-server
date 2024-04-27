"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateNotification = exports.getUnreadNotifcation = void 0;
const notification_1 = require("../models/notification");
const catchAsyncError_1 = require("../middlewares/catchAsyncError");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
exports.getUnreadNotifcation = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const notifications = yield notification_1.notificationModel
            .find({
            userId,
            status: "unread",
        })
            .populate({
            path: "from",
            select: "name avatar",
        });
        res.status(200).json({
            success: true,
            notifications,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 405));
    }
}));
exports.updateNotification = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const notification = yield notification_1.notificationModel.findById(id);
        if (!notification) {
            return next(new ErrorHandler_1.default("notfound", 401));
        }
        notification.status = "read";
        yield (notification === null || notification === void 0 ? void 0 : notification.save());
        res.status(201).json({ success: true });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 405));
    }
}));
//# sourceMappingURL=notification.controller.js.map