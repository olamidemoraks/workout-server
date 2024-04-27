"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationModel = void 0;
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    from: { type: mongoose_1.Schema.Types.ObjectId, ref: "User", required: true },
    workoutId: String,
    type: { type: String, required: true },
    content: String,
    status: {
        type: String,
        default: "unread",
        enum: ["read", "unread"],
    },
});
exports.notificationModel = (0, mongoose_1.model)("Notification", notificationSchema);
//# sourceMappingURL=notification.js.map