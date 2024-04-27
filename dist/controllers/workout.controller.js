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
exports.getAllWorkoutBaseOnEachCategory = exports.getWorkoutByCategoryName = exports.getWorkout = exports.getAllWorkout = exports.deleteWorkout = exports.updateWorkout = exports.createWorkout = void 0;
const exercise_model_1 = __importDefault(require("../models/exercise.model"));
const workout_model_1 = __importDefault(require("../models/workout.model"));
const catchAsyncError_1 = require("../middlewares/catchAsyncError");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const category_model_1 = __importDefault(require("../models/category.model"));
exports.createWorkout = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { female_image, image, exercises } = req.body;
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
        const workout = yield workout_model_1.default.create(req.body);
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
exports.updateWorkout = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { image, female_image } = req.body;
        const workout = yield workout_model_1.default.findById(id);
        if (!workout) {
            return next(new ErrorHandler_1.default("Workout doesn't exist", 404));
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
        if (typeof female_image === "string") {
            yield cloudinary_1.default.v2.uploader.destroy(workout.female_image.public_id);
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(female_image, {
                folder: "workout_female_image",
            });
            req.body.female_image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const updatedWorkout = yield workout_model_1.default.findByIdAndUpdate({ _id: id }, req.body, { new: true });
        res.status(200).json({
            success: true,
            message: "Workout Updated",
            workout: updatedWorkout,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.deleteWorkout = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const workout = yield workout_model_1.default.findById(id);
        if (!workout) {
            return next(new ErrorHandler_1.default("Workout doesn't exist", 404));
        }
        yield cloudinary_1.default.v2.uploader.destroy(workout.image.public_id);
        yield workout_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Workout deleted",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getAllWorkout = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const workouts = yield workout_model_1.default.find({}).sort("-createdAt");
        res.status(200).json({
            success: true,
            workouts,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getWorkout = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const workout = yield workout_model_1.default.findById(id);
        const exercises = yield Promise.all(workout.exercises.map((value) => __awaiter(void 0, void 0, void 0, function* () {
            const exercise = yield exercise_model_1.default.findOne({ _id: value.exercise_id });
            console.log(exercise);
            return Object.assign(Object.assign({}, exercise === null || exercise === void 0 ? void 0 : exercise._doc), value === null || value === void 0 ? void 0 : value._doc);
        })));
        const workoutWithExercise = Object.assign(Object.assign({}, workout === null || workout === void 0 ? void 0 : workout._doc), { exercises });
        res.status(200).json({
            success: true,
            workout: workoutWithExercise,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getWorkoutByCategoryName = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.params;
    try {
        const freemiumWorkout = yield workout_model_1.default.find({
            premium: false,
            focus_point: name,
        }).sort("difficult_level");
        res.status(200).json({
            success: true,
            workouts: freemiumWorkout,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getAllWorkoutBaseOnEachCategory = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_model_1.default.find({})
            .sort({ title: 1 })
            .select("_id title");
        const categoryWithWorkout = yield Promise.all(categories.map((category) => __awaiter(void 0, void 0, void 0, function* () {
            const workouts = yield workout_model_1.default.find({
                focus_point: String(category._id),
            })
                .sort("difficult_level")
                .select("image name premium difficult_level");
            const data = {};
            data[category.title] = workouts;
            return data;
        })));
        res.status(200).json({
            success: true,
            workout: categoryWithWorkout,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
//# sourceMappingURL=workout.controller.js.map