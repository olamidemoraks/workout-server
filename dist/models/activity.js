"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const activitySchema = new mongoose_1.Schema({
    userId: {
        required: true,
        type: String,
    },
    workoutId: {
        required: true,
        type: String,
    },
    workoutName: {
        required: true,
        type: String,
    },
    totalTime: {
        required: true,
        type: Number,
    },
    workoutType: {
        type: String,
        enum: ["default", "challenge", "customize"],
        default: "challenge",
    },
}, { timestamps: true });
const activityModel = (0, mongoose_1.model)("Activity", activitySchema);
exports.default = activityModel;
//# sourceMappingURL=activity.js.map