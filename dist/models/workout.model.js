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
exports.exerciseSchema = void 0;
const mongoose_1 = __importStar(require("mongoose"));
exports.exerciseSchema = new mongoose_1.Schema({
    exercise_id: String,
    time_base: Boolean,
    repetition: Number,
    rest: Number,
    sets: {
        default: 1,
        type: Number,
    },
});
const workoutSchema = new mongoose_1.default.Schema({
    name: {
        required: true,
        type: String,
    },
    image: {
        public_id: String,
        url: String,
    },
    female_image: {
        public_id: String,
        url: String,
    },
    exercises: [exports.exerciseSchema],
    description: String,
    difficult_level: {
        enum: [0, 1, 2, 3],
        type: Number,
        required: true,
    },
    premium: {
        type: Boolean,
        default: false,
    },
    estimate_time: String,
    location: {
        enum: ["gym", "home", "anywhere"],
        default: "home",
        type: String,
    },
    focus_point: { type: String, ref: "Category" },
}, { timestamps: true });
const workoutModel = (0, mongoose_1.model)("Workout", workoutSchema);
exports.default = workoutModel;
//# sourceMappingURL=workout.model.js.map