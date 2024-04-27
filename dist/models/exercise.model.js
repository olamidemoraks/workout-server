"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const exerciseSchema = new mongoose_1.default.Schema({
    name: String,
    image: {
        public_id: String,
        url: String,
    },
    female_image: {
        public_id: String,
        url: String,
    },
    tips: String,
    equipment: String,
    location: {
        enum: ["gym", "home"],
        default: "home",
        type: String,
    },
    focus: [String],
}, { timestamps: true });
const exerciseModel = mongoose_1.default.model("Exercise", exerciseSchema);
exports.default = exerciseModel;
//# sourceMappingURL=exercise.model.js.map