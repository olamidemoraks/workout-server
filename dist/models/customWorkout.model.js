"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const workout_model_1 = require("./workout.model");
const metricsSchema = new mongoose_1.Schema({
    userId: String,
    createdAt: Date,
    feedback: {
        type: String,
        default: "alright",
    },
    difficulty: {
        type: Number,
        default: 0,
    },
});
const invitedFriendScheme = new mongoose_1.Schema({
    id: { type: mongoose_1.default.Types.ObjectId, ref: "User" },
    status: {
        type: String,
        default: "pending",
    },
});
const customWorkoutSchema = new mongoose_1.Schema({
    name: {
        required: true,
        type: String,
    },
    creatorId: {
        required: true,
        type: String,
        ref: "User",
    },
    image: {
        public_id: String,
        url: String,
    },
    exercises: [workout_model_1.exerciseSchema],
    estimate_time: String,
    location: {
        enum: ["gym", "home", "anywhere"],
        default: "home",
        type: String,
    },
    invitedUser: {
        type: Map,
        of: invitedFriendScheme,
    },
    userMetrics: {
        type: Map,
        of: metricsSchema,
    },
}, { timestamps: true });
const customWorkoutModel = (0, mongoose_1.model)("CustomWorkout", customWorkoutSchema);
exports.default = customWorkoutModel;
//# sourceMappingURL=customWorkout.model.js.map