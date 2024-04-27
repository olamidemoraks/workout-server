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
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotificationService = exports.notificationType = void 0;
const notification_1 = require("../models/notification");
exports.notificationType = {
    FOLLOW_REQUEST: "follow-request",
    INVITE_REQUEST: "invite-request",
    ACHIEVEMENT: "follow-request",
};
const createNotificationService = ({ userIds, from, type, content, workoutId, }) => __awaiter(void 0, void 0, void 0, function* () {
    let data = [];
    if (userIds.length > 1) {
        userIds.forEach((id) => {
            data = [
                ...data,
                {
                    userId: id,
                    type,
                    content,
                    from,
                    workoutId,
                },
            ];
        });
        yield notification_1.notificationModel.insertMany(data);
    }
    else {
        yield notification_1.notificationModel.create({
            userId: userIds[0],
            type,
            content,
            from,
        });
    }
});
exports.createNotificationService = createNotificationService;
//# sourceMappingURL=notification.js.map