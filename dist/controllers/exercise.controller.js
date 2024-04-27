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
exports.getExercise = exports.getExercises = exports.deleteExercise = exports.updateExercise = exports.createExercise = void 0;
const exercise_model_1 = __importDefault(require("../models/exercise.model"));
const catchAsyncError_1 = require("../middlewares/catchAsyncError");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
exports.createExercise = (0, catchAsyncError_1.CatchAsyncError)(function (req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { name, image, female_image, instruction_video } = req.body;
            const isExerciseNameExist = yield exercise_model_1.default.findOne({ name });
            if (isExerciseNameExist)
                return next(new ErrorHandler_1.default("Name has been used. Please use another exercise name", 400));
            if (image) {
                const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
                    folder: "exercise_image",
                    overwrite: true,
                });
                req.body.image = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }
            if (female_image) {
                const myCloud = yield cloudinary_1.default.v2.uploader.upload(female_image, {
                    folder: "exercise_image",
                    overwrite: true,
                });
                req.body.female_image = {
                    public_id: myCloud.public_id,
                    url: myCloud.secure_url,
                };
            }
            // if (instruction_video) {
            //   const myCloud = await cloudinary.v2.uploader.upload(instruction_video, {
            //     resource_type: "video",
            //     folder: "exercise_video",
            //   });
            //   req.body.instruction_video = {
            //     public_id: myCloud.public_id,
            //     url: myCloud.secure_url,
            //   };
            // }
            const exercise = yield exercise_model_1.default.create(Object.assign({}, req.body));
            res.status(201).json({
                success: true,
                message: "Exercise created",
                exercise,
            });
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 400));
        }
    });
});
exports.updateExercise = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const { name, image, female_image, instruction_video } = req.body;
        const nameExist = yield exercise_model_1.default.find({ name });
        const isExist = nameExist.filter((item) => item._id.toString() !== id);
        if (isExist.length > 0) {
            return next(new ErrorHandler_1.default("Name has been used. Please use another exercise name.", 400));
        }
        const exercise = yield exercise_model_1.default.findById(id);
        console.log(exercise);
        if (!exercise) {
            return next(new ErrorHandler_1.default("Exercise doesn't exist.", 404));
        }
        if (typeof image === "string") {
            yield cloudinary_1.default.v2.uploader.destroy(exercise.image.public_id);
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
                folder: "exercise_image",
            });
            req.body.image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        if (typeof female_image === "string") {
            yield cloudinary_1.default.v2.uploader.destroy(exercise.female_image.public_id);
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(female_image, {
                folder: "exercise_female_image",
            });
            req.body.female_image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const updatedExercise = yield exercise_model_1.default.findByIdAndUpdate({ _id: id }, req.body, { new: true });
        res.status(200).json({
            success: true,
            message: "Exercise updated",
            exercise: updatedExercise,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.deleteExercise = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const exercise = yield exercise_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: `${exercise === null || exercise === void 0 ? void 0 : exercise.name} deleted`,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getExercises = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { focus_point } = req.query;
        console.log(focus_point);
        let searchQuery = {};
        if (focus_point) {
            searchQuery.focus = focus_point;
        }
        const exercises = yield exercise_model_1.default.find(searchQuery).sort("-createdAt");
        res.status(200).json({
            success: true,
            exercises,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getExercise = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const exercise = yield exercise_model_1.default.findById(id);
        if (!exercise) {
            return next(new ErrorHandler_1.default("Exercise doesn't exist.", 404));
        }
        res.status(200).json({
            success: true,
            exercise,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
//# sourceMappingURL=exercise.controller.js.map