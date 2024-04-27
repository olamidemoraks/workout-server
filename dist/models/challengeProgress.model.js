"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const challengeProgress = new mongoose_1.Schema({
    challengeId: {
        required: true,
        type: String,
    },
    userId: {
        required: true,
        type: String,
    },
    day: {
        default: 1,
        type: Number,
    },
    isCompleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const challengeProgressModel = (0, mongoose_1.model)("ChallengeProgress", challengeProgress);
exports.default = challengeProgressModel;
//# sourceMappingURL=challengeProgress.model.js.map