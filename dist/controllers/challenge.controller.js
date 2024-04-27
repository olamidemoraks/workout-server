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
exports.pinChallenge = exports.completedChallenge = exports.startChallenge = exports.getChallengeInfo = exports.getCurrentChallenge = exports.getFrontalChallenge = exports.getChallenge = exports.deleteChallenges = exports.getAllChallenges = exports.updateChallenges = exports.createChallenges = void 0;
const catchAsyncError_1 = require("../middlewares/catchAsyncError");
const challenge_model_1 = __importDefault(require("../models/challenge.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const exercise_model_1 = __importDefault(require("../models/exercise.model"));
const challengeProgress_model_1 = __importDefault(require("../models/challengeProgress.model"));
const activity_1 = __importDefault(require("../models/activity"));
const node_cron_1 = __importDefault(require("node-cron"));
const user_model_1 = __importDefault(require("../models/user.model"));
const redis_1 = require("../utils/redis");
exports.createChallenges = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { image } = req.body;
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
        const challenge = yield challenge_model_1.default.create(Object.assign({}, req.body));
        res.status(201).json({
            success: true,
            challenge,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.updateChallenges = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id } = req.params;
        const { image } = req.body;
        const challenge = yield challenge_model_1.default.findById(id);
        if (!challenge) {
            return next(new ErrorHandler_1.default("Workout doesn't exist", 404));
        }
        if (typeof image === "string") {
            yield cloudinary_1.default.v2.uploader.destroy((_a = challenge === null || challenge === void 0 ? void 0 : challenge.image) === null || _a === void 0 ? void 0 : _a.public_id);
            const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
                folder: "challenge_image",
            });
            req.body.image = {
                public_id: myCloud.public_id,
                url: myCloud.secure_url,
            };
        }
        const updatedChallenge = yield challenge_model_1.default.findByIdAndUpdate({ _id: id }, req.body, { new: true });
        res.status(200).json({
            success: true,
            message: "Challenge Updated",
            challenge: updatedChallenge,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getAllChallenges = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const challenges = yield challenge_model_1.default
            .find()
            .select("name days image premium title location");
        res.status(200).json({
            success: true,
            challenges,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.deleteChallenges = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const { id } = req.params;
        const challenge = yield challenge_model_1.default.findById(id);
        if (!challenge) {
            return next(new ErrorHandler_1.default("Workout doesn't exist", 404));
        }
        yield cloudinary_1.default.v2.uploader.destroy((_b = challenge === null || challenge === void 0 ? void 0 : challenge.image) === null || _b === void 0 ? void 0 : _b.public_id);
        yield challenge_model_1.default.findByIdAndDelete(id);
        res.status(200).json({
            success: true,
            message: "Delete Successfull",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getChallenge = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const challenge = yield challenge_model_1.default.findById(id);
        const challenges = yield Promise.all(challenge.challenges.map((workouts) => __awaiter(void 0, void 0, void 0, function* () {
            const challengeWorkout = yield Promise.all(workouts.map((workout) => __awaiter(void 0, void 0, void 0, function* () {
                const exercise = yield exercise_model_1.default.findOne({
                    _id: workout.exercise_id,
                }).select("name image");
                return Object.assign(Object.assign({}, exercise === null || exercise === void 0 ? void 0 : exercise._doc), workout === null || workout === void 0 ? void 0 : workout._doc);
            })));
            return [...challengeWorkout];
        })));
        const challengesWithWorkout = Object.assign({}, challenge === null || challenge === void 0 ? void 0 : challenge._doc);
        challengesWithWorkout.challenges = challenges;
        res.status(200).json({
            success: true,
            challenge: challengesWithWorkout,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getFrontalChallenge = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    try {
        const userId = (_c = req.user) === null || _c === void 0 ? void 0 : _c._id;
        const pinnedCategoryId = (_d = req.user) === null || _d === void 0 ? void 0 : _d.challengePin;
        let challenges;
        if ((pinnedCategoryId === null || pinnedCategoryId === void 0 ? void 0 : pinnedCategoryId.length) === 0) {
            challenges = yield challenge_model_1.default
                .find()
                .select("name days image premium title location");
        }
        else {
            challenges = yield challenge_model_1.default
                .find({ _id: { $in: pinnedCategoryId } })
                .select("name days image premium title location");
        }
        const challengeUserprogress = yield Promise.all(challenges.map((challenge) => __awaiter(void 0, void 0, void 0, function* () {
            var _e, _f;
            const challengeProgess = yield challengeProgress_model_1.default.findOne({
                challengeId: challenge._id,
                userId,
            });
            return Object.assign(Object.assign({}, challenge === null || challenge === void 0 ? void 0 : challenge._doc), { progress: (_e = challengeProgess === null || challengeProgess === void 0 ? void 0 : challengeProgess.day) !== null && _e !== void 0 ? _e : null, isCompleted: (_f = challengeProgess === null || challengeProgess === void 0 ? void 0 : challengeProgess.isCompleted) !== null && _f !== void 0 ? _f : false });
        })));
        res.status(200).json({
            success: true,
            challenges: challengeUserprogress,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getCurrentChallenge = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const userId = (_g = req.user) === null || _g === void 0 ? void 0 : _g._id;
        const userProgressChallenge = yield challengeProgress_model_1.default.find({ userId });
        const userCurrentChallenge = yield Promise.all(userProgressChallenge.map((progress) => __awaiter(void 0, void 0, void 0, function* () {
            var _h;
            const userChallenge = yield challenge_model_1.default
                .findById(progress.challengeId)
                .select("name days image premium title location");
            return Object.assign(Object.assign({}, userChallenge === null || userChallenge === void 0 ? void 0 : userChallenge._doc), { progress: (_h = progress === null || progress === void 0 ? void 0 : progress.day) !== null && _h !== void 0 ? _h : null });
        })));
        res.status(200).json({
            success: true,
            challenges: userCurrentChallenge,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.getChallengeInfo = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _j, _k, _l;
    try {
        const { id } = req.params;
        const userId = (_j = req.user) === null || _j === void 0 ? void 0 : _j._id;
        const challenge = yield challenge_model_1.default
            .findById(id)
            .select("name days image premium title location");
        const userProgress = yield challengeProgress_model_1.default.findOne({
            challengeId: id,
            userId,
        });
        res.status(200).json({
            success: true,
            challenge,
            currentDay: (_k = userProgress === null || userProgress === void 0 ? void 0 : userProgress.day) !== null && _k !== void 0 ? _k : 1,
            isCompleted: (_l = userProgress === null || userProgress === void 0 ? void 0 : userProgress.isCompleted) !== null && _l !== void 0 ? _l : false,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.startChallenge = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _m, _o;
    try {
        const { id } = req.params;
        const userId = (_m = req.user) === null || _m === void 0 ? void 0 : _m._id;
        const challenge = yield challenge_model_1.default.findById(id);
        const userProgress = yield challengeProgress_model_1.default.findOne({
            challengeId: id,
            userId,
        });
        const currentChallenge = challenge === null || challenge === void 0 ? void 0 : challenge.challenges[(_o = userProgress === null || userProgress === void 0 ? void 0 : userProgress.day) !== null && _o !== void 0 ? _o : 0];
        const exercises = yield Promise.all(currentChallenge.map((value) => __awaiter(void 0, void 0, void 0, function* () {
            const exercise = yield exercise_model_1.default.findOne({ _id: value.exercise_id });
            return Object.assign(Object.assign({}, exercise === null || exercise === void 0 ? void 0 : exercise._doc), value === null || value === void 0 ? void 0 : value._doc);
        })));
        const workout = {
            day: userProgress === null || userProgress === void 0 ? void 0 : userProgress.day,
            image: challenge === null || challenge === void 0 ? void 0 : challenge.image,
            name: challenge === null || challenge === void 0 ? void 0 : challenge.title,
            _id: challenge === null || challenge === void 0 ? void 0 : challenge._id,
            exercises,
        };
        res.status(200).json({
            success: true,
            workout,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
// export const createChallengeProgress = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { challengeId } = req.body;
//       const userId = req.user?._id;
//       const progress = await ChallengProgress.findOne({ challengeId, userId });
//       if (!progress) {
//         await ChallengProgress.create({ challengeId, userId });
//         res.status(201).json({
//           success: true,
//           message: "progress created",
//         });
//       }
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );
exports.completedChallenge = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _p, _q, _r, _s, _t, _u;
    try {
        const { challengeId, workoutName, totalTime, weight } = req.body;
        const userId = (_p = req.user) === null || _p === void 0 ? void 0 : _p._id;
        if (totalTime < 60) {
            return next(new ErrorHandler_1.default("total time less than 1 sec", 400));
        }
        const progress = yield challengeProgress_model_1.default.findOne({ challengeId, userId });
        const challengeData = {
            challengeId,
            isCompleted: true,
            userId,
        };
        const activityData = {
            workoutId: challengeId,
            workoutName,
            userId,
            totalTime,
        };
        if (((_q = req.user) === null || _q === void 0 ? void 0 : _q.weight) !== weight) {
            const data = {
                weight,
                weightHistory: (_r = req.user) === null || _r === void 0 ? void 0 : _r.weightHistory,
            };
            (_s = data.weightHistory) === null || _s === void 0 ? void 0 : _s.push({
                weight: weight,
                createdAt: new Date(),
            });
            const user = yield user_model_1.default.findByIdAndUpdate((_t = req.user) === null || _t === void 0 ? void 0 : _t._id, data, {
                new: true,
            });
            yield redis_1.redis.set((_u = req.user) === null || _u === void 0 ? void 0 : _u._id, JSON.stringify(user));
        }
        if (!progress) {
            yield challengeProgress_model_1.default.create(challengeData);
        }
        else {
            yield challengeProgress_model_1.default.findByIdAndUpdate(challengeId, {
                $set: challengeData,
            }, { new: true });
        }
        yield activity_1.default.create(activityData);
        res.status(201).json({
            success: true,
            message: "progress updated",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
exports.pinChallenge = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _v, _w, _x;
    try {
        const userId = (_v = req.user) === null || _v === void 0 ? void 0 : _v._id;
        const challengeId = req.body.id;
        const user = yield user_model_1.default.findById(userId);
        if (!(user === null || user === void 0 ? void 0 : user.challengePin.includes(challengeId))) {
            user === null || user === void 0 ? void 0 : user.challengePin.push(challengeId);
        }
        else {
            user.challengePin = user.challengePin.filter((id) => id !== challengeId);
        }
        yield (user === null || user === void 0 ? void 0 : user.save());
        yield redis_1.redis.set((_w = req.user) === null || _w === void 0 ? void 0 : _w._id, JSON.stringify(user));
        res
            .status(200)
            .json({ success: true, challenges: (_x = user === null || user === void 0 ? void 0 : user.challengePin) !== null && _x !== void 0 ? _x : [] });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 400));
    }
}));
node_cron_1.default.schedule("0 3 * * 1-7", function () {
    return __awaiter(this, void 0, void 0, function* () {
        const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 1000);
        yield challengeProgress_model_1.default.updateMany({
            isCompleted: true,
            updatedAt: { $lt: oneDayAgo },
        }, {
            $inc: { day: 1, isCompleted: false },
        });
        console.log("Cron job update");
    });
});
//# sourceMappingURL=challenge.controller.js.map