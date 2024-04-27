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
const mongoose_1 = __importDefault(require("mongoose"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const emailRegexPattern = /^[^\$@]+@[^\$@]+\.[^\$@]+$/;
const userSchema = new mongoose_1.default.Schema({
    name: { type: String },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: function (value) {
                return emailRegexPattern.test(value);
            },
            message: "Please enter a valid email address",
        },
    },
    password: {
        type: String,
        minlength: [6, "Password is to short"],
        select: false,
    },
    username: {
        type: String,
        unique: true,
    },
    age: {
        type: Date,
    },
    gender: {
        enum: ["male", "female"],
        type: String,
    },
    goals: {
        type: String,
    },
    height: {
        type: String,
    },
    weight: {
        type: String,
    },
    weightHistory: [
        {
            weight: Number,
            createdAt: Date,
        },
    ],
    role: {
        type: String,
        default: "user",
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    avatar: {
        public_id: String,
        url: String,
    },
    steps: {
        type: String,
        default: "gender",
        // start, gender, age, weight, level, completed
    },
    level: {
        type: Number,
    },
    weightMeasure: {
        type: String,
        enum: ["kg", "lg"],
    },
    heightMeasure: {
        type: String,
        enum: ["cm", "ft"],
    },
    followers: {
        type: [String],
    },
    following: {
        type: [String],
    },
    challengePin: {
        type: [String],
    },
}, { timestamps: true });
//sign access token
userSchema.methods.SignAccessToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.ACCESS_TOKEN, {
        expiresIn: "1h",
    });
};
//sign refresh token
userSchema.methods.SignRefreshToken = function () {
    return jsonwebtoken_1.default.sign({ id: this._id }, process.env.REFRESH_TOKEN, {
        expiresIn: "3d",
    });
};
userSchema.methods.comparePassword = function (enterPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcryptjs_1.default.compare(enterPassword, this.password || "@__");
    });
};
const userModel = mongoose_1.default.model("User", userSchema);
exports.default = userModel;
//# sourceMappingURL=user.model.js.map