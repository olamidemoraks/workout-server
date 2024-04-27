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
exports.deleteCustomWorkout = exports.getCustomWorkoutById = exports.inviteResponse = exports.inviteFriend = exports.getInvitedUserFromCustomWorkout = exports.updateCustomWorkout = exports.getUserCustomWorkouts = exports.createCustomWorkout = void 0;
const catchAsyncError_1 = require("../middlewares/catchAsyncError");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const customWorkout_model_1 = __importDefault(require("../models/customWorkout.model"));
const exercise_model_1 = __importDefault(require("../models/exercise.model"));
const notification_1 = require("../service/notification");
const mongoose_1 = __importDefault(require("mongoose"));
exports.createCustomWorkout = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { female_image, image, exercises } = req.body;
        req.body.creatorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        if (exercises.length === 0) {
            return next(new ErrorHandler_1.default("Please add exercises to workout", 400));
        }
        if (female_image) {
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(female_image, {
                folder: "workout_female_image",
            });
            req.body.female_image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        if (image) {
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
                folder: "workout_image",
            });
            req.body.image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const workout = yield customWorkout_model_1.default.create(req.body);
        res.status(201).json({
            success: true,
            message: "Workout created",
            workout,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getUserCustomWorkouts = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.userId;
        const objectUserId = new mongoose_1.default.Types.ObjectId(userId);
        const workouts = yield customWorkout_model_1.default.find({ creatorId: userId });
        const customWorkout = yield customWorkout_model_1.default
            .find({})
            .populate({ path: "creatorId", select: "username name avatar" });
        const allworkout = customWorkout.filter((workout) => workout.invitedUser.has(userId));
        res
            .status(200)
            .json({ success: true, workouts: [...workouts, ...allworkout] });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.updateCustomWorkout = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { image, exercises } = req.body;
        const workout = yield customWorkout_model_1.default.findById(id);
        if (!workout) {
            return next(new ErrorHandler_1.default("Workout doesn't exist", 404));
        }
        if (exercises.length === 0) {
            return next(new ErrorHandler_1.default("Please add exercises to workout", 400));
        }
        if (typeof image === "string") {
            yield cloudinary_1.default.v2.uploader.destroy(workout.image.public_id);
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
                folder: "workout_image",
            });
            req.body.image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        yield customWorkout_model_1.default.findByIdAndUpdate({ _id: id }, req.body, {
            new: true,
        });
        res.status(200).json({
            success: true,
            message: "Workout Updated",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getInvitedUserFromCustomWorkout = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const id = req.params.id;
        const workout = yield customWorkout_model_1.default.findById(id);
        if (!workout) {
            return next(new ErrorHandler_1.default("Workout doesn't exist", 404));
        }
        const invitedUser = (_b = Array.from(workout === null || workout === void 0 ? void 0 : workout.invitedUser.keys())) !== null && _b !== void 0 ? _b : [];
        res.status(200).json({ success: true, users: invitedUser });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.inviteFriend = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const { id } = req.params;
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
        const username = (_d = req.user) === null || _d === void 0 ? void 0 : _d.username;
        const { invitedUser } = req.body;
        const workout = yield customWorkout_model_1.default.findById(id);
        if (!workout) {
            return next(new ErrorHandler_1.default("Workout doesn't exist", 404));
        }
        else if (!workout.invitedUser) {
            workout.invitedUser = new Map();
        }
        if (userId !== (workout === null || workout === void 0 ? void 0 : workout.creatorId)) {
            return next(new ErrorHandler_1.default("Forbided", 400));
        }
        invitedUser.map((id) => {
            const invite = {
                id,
                status: "pending",
            };
            workout.invitedUser.set(id, invite);
        });
        yield workout.save();
        yield (0, notification_1.createNotificationService)({
            userIds: [...invitedUser],
            from: userId,
            type: notification_1.notificationType.INVITE_REQUEST,
            content: `${username} invited you to join ${workout.name} ${workout.name.toLowerCase().split(" ").includes("workout")
                ? ""
                : "workout"}`,
            workoutId: id,
        });
        res.status(200).json({
            success: true,
            message: "Workout Updated",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.inviteResponse = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e._id;
        if (!userId) {
            return next(new ErrorHandler_1.default("User ID is undefined", 400));
        }
        const { id } = req.params;
        const { status } = req.body;
        console.log(`response status ${status}`);
        const workout = yield customWorkout_model_1.default.findById(id);
        if (!workout) {
            return next(new ErrorHandler_1.default("Workout doesn't exist", 404));
        }
        const inviteResponse = {
            id: userId,
            status,
        };
        console.log({ workout, inviteResponse });
        workout.invitedUser.set(userId, inviteResponse);
        yield workout.save();
        res.status(200).json({
            success: true,
            message: "user responded to request",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 405));
    }
}));
exports.getCustomWorkoutById = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f, _g;
    try {
        const id = req.params.id;
        const userId = (_f = req.user) === null || _f === void 0 ? void 0 : _f._id;
        const workout = yield customWorkout_model_1.default.findById(id);
        let exercises = yield Promise.all(workout.exercises.map((value) => __awaiter(void 0, void 0, void 0, function* () {
            const exercise = yield exercise_model_1.default.findOne({
                _id: value.exercise_id,
            });
            return Object.assign(Object.assign({}, exercise === null || exercise === void 0 ? void 0 : exercise._doc), value === null || value === void 0 ? void 0 : value._doc);
        })));
        if (!workout) {
            console.error("workout is undefined");
        }
        else if (!workout.userMetrics) {
            workout.userMetrics = new Map();
        }
        const difficulty = (_g = workout === null || workout === void 0 ? void 0 : workout.userMetrics.get(userId)) === null || _g === void 0 ? void 0 : _g.difficulty;
        console.log({ difficulty });
        if (difficulty) {
            exercises = exercises.map((exercise) => {
                return Object.assign(Object.assign({}, exercise), { repetition: exercise.repetition + difficulty });
            });
        }
        const workoutWithExercise = Object.assign(Object.assign({}, workout === null || workout === void 0 ? void 0 : workout._doc), { exercises });
        res.status(200).json({ success: true, workout: workoutWithExercise });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 405));
    }
}));
exports.deleteCustomWorkout = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        const { id } = req.params;
        const workout = yield customWorkout_model_1.default.findById(id);
        if (!workout) {
            return next(new ErrorHandler_1.default("Workout doesn't exist", 404));
        }
        if ((workout === null || workout === void 0 ? void 0 : workout.creatorId) !== ((_h = req.user) === null || _h === void 0 ? void 0 : _h._id)) {
            return next(new ErrorHandler_1.default("Can't delete another user workout", 404));
        }
        yield cloudinary_1.default.v2.uploader.destroy(workout.image.public_id);
        yield customWorkout_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Workout deleted",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
//# sourceMappingURL=customWorkout.controller.js.map