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
exports.recentActivities = exports.activityYearReport = exports.createActivity = void 0;
const catchAsyncError_1 = require("../middlewares/catchAsyncError");
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const activity_1 = __importDefault(require("../models/activity"));
const workout_model_1 = __importDefault(require("../models/workout.model"));
const user_model_1 = __importDefault(require("../models/user.model"));
const redis_1 = require("../utils/redis");
const category_model_1 = __importDefault(require("../models/category.model"));
const customWorkout_model_1 = __importDefault(require("../models/customWorkout.model"));
exports.createActivity = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    req.body.userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
    try {
        const { userId, workoutId, totalTime, weight, workoutType, feedback } = req.body;
        const feedbackMode = {
            1: "hard",
            2: "alright",
            3: "easy",
        };
        if (!userId && !workoutId) {
            return next(new ErrorHandler_1.default("Invalid information", 400));
        }
        if (totalTime < 60) {
            return next(new ErrorHandler_1.default("total time less than 1 sec", 400));
        }
        if (((_b = req.user) === null || _b === void 0 ? void 0 : _b.weight) !== weight) {
            const data = {
                weight,
                weightHistory: (_c = req.user) === null || _c === void 0 ? void 0 : _c.weightHistory,
            };
            (_d = data.weightHistory) === null || _d === void 0 ? void 0 : _d.push({
                weight: weight,
                createdAt: new Date(),
            });
            const user = yield user_model_1.default.findByIdAndUpdate((_e = req.user) === null || _e === void 0 ? void 0 : _e._id, data, {
                new: true,
            });
            yield redis_1.redis.set((_f = req.user) === null || _f === void 0 ? void 0 : _f._id, JSON.stringify(user));
        }
        let data;
        if (workoutType === "default") {
            const workout = yield workout_model_1.default.findById(workoutId);
            const category = yield category_model_1.default.findById(workout === null || workout === void 0 ? void 0 : workout.focus_point);
            data = {
                userId,
                workoutId: workout === null || workout === void 0 ? void 0 : workout._id,
                workoutName: category === null || category === void 0 ? void 0 : category.title,
                workoutType,
                totalTime,
            };
            yield activity_1.default.create(data);
        }
        else if (workoutType === "customize") {
            const customizeWorkout = yield customWorkout_model_1.default.findById(workoutId);
            data = {
                userId,
                workoutId: customizeWorkout === null || customizeWorkout === void 0 ? void 0 : customizeWorkout._id,
                workoutName: customizeWorkout === null || customizeWorkout === void 0 ? void 0 : customizeWorkout.name,
                workoutType,
                totalTime,
            };
            let metricsData = {
                userId,
                feedback: feedbackMode[feedback],
                difficulty: 0,
                createdAt: new Date(),
            };
            if (!customizeWorkout) {
                console.error("customizeWorkout is undefined");
            }
            else if (!customizeWorkout.userMetrics) {
                customizeWorkout.userMetrics = new Map();
            }
            const userMetric = customizeWorkout === null || customizeWorkout === void 0 ? void 0 : customizeWorkout.userMetrics.get(userId);
            // Ensure that userMetric is defined before accessing its properties
            if (userMetric) {
                switch (feedback) {
                    case 1:
                        metricsData.difficulty = ((_g = userMetric.difficulty) !== null && _g !== void 0 ? _g : 0) - 5;
                        break;
                    case 2:
                        metricsData.difficulty = (_h = userMetric.difficulty) !== null && _h !== void 0 ? _h : 0;
                        break;
                    case 3:
                        metricsData.difficulty = ((_j = userMetric.difficulty) !== null && _j !== void 0 ? _j : 0) + 5;
                        break;
                    default:
                        break;
                }
            }
            console.log({ metricsData });
            customizeWorkout === null || customizeWorkout === void 0 ? void 0 : customizeWorkout.userMetrics.set(userId, metricsData);
            // customizeWorkout?.metrics.push(metricsData);
            yield Promise.all([
                yield activity_1.default.create(data),
                yield (customizeWorkout === null || customizeWorkout === void 0 ? void 0 : customizeWorkout.save()),
            ]);
        }
        res.status(201).json({ success: true });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.activityYearReport = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _k;
    try {
        const userId = (_k = req.user) === null || _k === void 0 ? void 0 : _k._id;
        const currentDate = new Date();
        currentDate.getMonth();
        // set date of tomorrow
        currentDate.setDate(currentDate.getDate() + 1);
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 10, currentDate.getDate());
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
        const monthYear = endDate.toLocaleString("default", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
        const activities = yield activity_1.default.find({
            userId,
            createdAt: {
                $gte: endDate,
                $lt: startDate,
            },
        });
        const activityReport = yield Promise.all(activities.reduce((accumulator, currentValue) => {
            const date = currentValue === null || currentValue === void 0 ? void 0 : currentValue.createdAt;
            const sameDate = accumulator.find((entry) => areDatesOnSameDay(new Date(entry === null || entry === void 0 ? void 0 : entry.createdAt), new Date(date)));
            if (sameDate) {
                sameDate.totalTime += currentValue.totalTime;
                sameDate.count += 1;
            }
            else {
                accumulator.push({
                    createdAt: date,
                    totalTime: currentValue.totalTime,
                    workoutName: currentValue.workoutName,
                    count: 1,
                });
            }
            return accumulator;
        }, []));
        res.status(200).json({
            success: true,
            activityReport,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
function areDatesOnSameDay(date1, date2) {
    return (date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate());
}
exports.recentActivities = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _l;
    try {
        const userId = (_l = req.user) === null || _l === void 0 ? void 0 : _l._id;
        const activities = yield activity_1.default
            .find({ userId })
            .sort("-createdAt");
        res.status(200).json({
            success: true,
            activities,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
//# sourceMappingURL=activity.controller.js.map