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
exports.deleteCategory = exports.updateCategory = exports.getCategory = exports.getAllCategory = exports.createCategory = void 0;
const catchAsyncError_1 = require("../middlewares/catchAsyncError");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const category_model_1 = __importDefault(require("../models/category.model"));
const cloudinary_1 = __importDefault(require("cloudinary"));
exports.createCategory = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { title, image } = req.body;
        const categoryNameExist = yield category_model_1.default.findOne({ title });
        if (categoryNameExist) {
            return next(new ErrorHandler_1.default(`${title} category already exist, try another! `, 400));
        }
        if (image) {
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
                folder: "challenge_image",
                overwrite: true,
            });
            req.body.image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const category = yield category_model_1.default.create(req.body);
        res.status(201).json({
            success: true,
            category,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getAllCategory = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categories = yield category_model_1.default.find({});
        res.status(200).json({
            success: true,
            categories,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getCategory = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const category = yield category_model_1.default.findById(id);
        if (!category) {
            return next(new ErrorHandler_1.default("Category does not exist", 400));
        }
        res.status(200).json({
            success: true,
            category,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.updateCategory = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const id = req.params.id;
        const { image } = req.body;
        const category = yield category_model_1.default.findById(id);
        if (!category) {
            return next(new ErrorHandler_1.default("Category does not exist", 400));
        }
        if (typeof image !== "object") {
            yield cloudinary_1.default.v2.uploader.destroy((_a = category === null || category === void 0 ? void 0 : category.image) === null || _a === void 0 ? void 0 : _a.public_id);
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
                folder: "challenge_image",
                overwrite: true,
            });
            req.body.image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        yield category_model_1.default.findByIdAndUpdate(id, Object.assign({}, req.body), { new: true });
        res.status(200).json({
            success: true,
            message: `${category.title} updated successful`,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.deleteCategory = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const id = req.params.id;
        const category = yield category_model_1.default.findById(id);
        if (!category) {
            return next(new ErrorHandler_1.default("Category does not exist", 400));
        }
        yield category_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: `${category.title} deleted successful`,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
//# sourceMappingURL=category.controller.js.map