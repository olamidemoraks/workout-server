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
exports.getFollowers = exports.getFollowing = exports.unfollowUser = exports.followUser = exports.getUser = exports.getUserStreak = exports.getUserInfo = exports.logoutUser = exports.updateUserProfileImage = exports.updateUserProfile = exports.checkUserExist = exports.socialAuth = exports.loginUser = exports.activateUser = exports.registerUser = exports.signInAdmin = exports.getAdminActivationCode = void 0;
const catchAsyncError_1 = require("../middlewares/catchAsyncError");
const user_model_1 = __importDefault(require("../models/user.model"));
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const path_1 = __importDefault(require("path"));
const ejs_1 = __importDefault(require("ejs"));
const sendMail_1 = __importDefault(require("../utils/sendMail"));
const jwt_1 = require("../utils/jwt");
const redis_1 = require("../utils/redis");
const activity_1 = __importDefault(require("../models/activity"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const notification_1 = require("../service/notification");
exports.getAdminActivationCode = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const admin = yield user_model_1.default.findOne({ email, role: "admin" });
        if (!admin) {
            return next(new ErrorHandler_1.default("User not authorized", 401));
        }
        const activationDetails = createActivationToken(email);
        const activationCode = activationDetails.activationCode;
        const data = { user: { name: email }, activationCode };
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mail/admin-code.ejs"), data);
        try {
            yield (0, sendMail_1.default)({
                data,
                email,
                subject: "Admin Signin activation Code",
                template: "admin-code.ejs",
            });
            res.status(200).json({
                success: true,
                message: `Please check your email to get your activation code`,
                activationToken: activationDetails.token,
            });
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 401));
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 405));
    }
}));
exports.signInAdmin = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activation_code, activation_token } = req.body;
        const adminUser = jsonwebtoken_1.default.verify(activation_token, process.env.ACTIVATION_SECRET);
        if (activation_code !== adminUser.activationCode) {
            return next(new ErrorHandler_1.default("Invalid activation code", 400));
        }
        const email = adminUser.user;
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            return next(new ErrorHandler_1.default("User does not exist", 404));
        }
        (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 401));
    }
}));
exports.registerUser = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, email, password, username } = req.body;
        const isAlreadyExist = yield user_model_1.default.findOne({ email });
        if (isAlreadyExist)
            return next(new ErrorHandler_1.default("An Account has been created with this email", 400));
        const user = {
            name,
            email,
            password,
            username,
        };
        const activationDetails = createActivationToken(user);
        const activationCode = activationDetails.activationCode;
        const data = { user: { name: user.name }, activationCode };
        const html = yield ejs_1.default.renderFile(path_1.default.join(__dirname, "../mail/activation-mail.ejs"), data);
        try {
            yield (0, sendMail_1.default)({
                data,
                email,
                subject: "Workout Activation Code",
                template: "activation-mail.ejs",
            });
            res.status(200).json({
                success: true,
                message: `Please check your email to get your activation code`,
                activationToken: activationDetails.token,
            });
        }
        catch (error) {
            return next(new ErrorHandler_1.default(error.message, 401));
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 401));
    }
}));
exports.activateUser = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { activation_code, activation_token } = req.body;
        const newUser = jsonwebtoken_1.default.verify(activation_token, process.env.ACTIVATION_SECRET);
        if (activation_code !== newUser.activationCode) {
            return next(new ErrorHandler_1.default("Invalid activation code", 400));
        }
        const { name, email, password, username } = newUser.user;
        const existUser = yield user_model_1.default.findOne({ email });
        if (existUser) {
            return next(new ErrorHandler_1.default("Email already exist, please proceed to login", 400));
        }
        const user = yield user_model_1.default.create({
            name,
            email,
            password,
            username,
            steps: "gender",
            isVerified: true,
        });
        (0, jwt_1.sendToken)(user, 200, res);
        // res.status(201).json({ success: true });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.loginUser = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return next(new ErrorHandler_1.default("Please enter email or password", 400));
        }
        const user = yield user_model_1.default.findOne({ email }).select("+password");
        if (!(user === null || user === void 0 ? void 0 : user.password)) {
            return next(new ErrorHandler_1.default("Invalid crediential, try with google provider", 401));
        }
        if (!user) {
            return next(new ErrorHandler_1.default("Invalid email or password", 404));
        }
        console.log(password);
        const isPasswordCorrect = yield user.comparePassword(password);
        console.log({ isPasswordCorrect });
        if (!isPasswordCorrect) {
            return next(new ErrorHandler_1.default("Invalid email or password", 404));
        }
        (0, jwt_1.sendToken)(user, 200, res);
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.socialAuth = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, name, username } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            const newUser = yield user_model_1.default.create({
                email,
                name,
                username,
                isVerified: true,
            });
            (0, jwt_1.sendToken)(newUser, 200, res);
        }
        else {
            (0, jwt_1.sendToken)(user, 200, res);
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.checkUserExist = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email } = req.body;
        const user = yield user_model_1.default.findOne({ email });
        if (!user) {
            res.status(200).json({
                success: false,
            });
        }
        else {
            res.status(200).json({
                success: true,
            });
        }
    }
    catch (error) { }
}));
const createActivationToken = (user) => {
    const activationCode = Math.floor(100 * Math.random() * 9000).toString();
    console.log(activationCode);
    const token = jsonwebtoken_1.default.sign({ user, activationCode }, process.env.ACTIVATION_SECRET, { expiresIn: "5m" });
    return {
        token,
        activationCode,
    };
};
exports.updateUserProfile = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = req.user;
        const profile = yield user_model_1.default.findByIdAndUpdate({ _id: user === null || user === void 0 ? void 0 : user._id }, Object.assign({}, req.body), { new: true });
        yield redis_1.redis.set(user === null || user === void 0 ? void 0 : user._id, JSON.stringify(profile));
        res.status(200).json({
            success: true,
            user: profile,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.updateUserProfileImage = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const id = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = yield user_model_1.default.findById(id);
        const { image } = req.body;
        if (!image) {
            return next(new ErrorHandler_1.default("Please provide user image", 400));
        }
        if ((_b = user === null || user === void 0 ? void 0 : user.avatar) === null || _b === void 0 ? void 0 : _b.public_id) {
            yield cloudinary_1.default.v2.uploader.destroy(user.avatar.public_id);
        }
        const myCloud = yield cloudinary_1.default.v2.uploader.upload(image, {
            folder: "avatar",
            overwrite: true,
        });
        const avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
        const updateProfile = yield user_model_1.default.findByIdAndUpdate(id, { avatar }, {
            new: true,
        });
        yield redis_1.redis.set(user === null || user === void 0 ? void 0 : user._id, JSON.stringify(updateProfile));
        console.log({ updateProfile });
        console.log({ avatar });
        res.status(200).json({
            success: true,
            message: "Image successfull changed",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.logoutUser = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _c;
    try {
        res.cookie("access_token", "", { maxAge: 1 }),
            res.cookie("refresh_token", "", { maxAge: 1 });
        console.log("Logout");
        const userId = ((_c = req.user) === null || _c === void 0 ? void 0 : _c._id) || "";
        redis_1.redis.del(userId);
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.getUserInfo = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _d;
    try {
        const userId = (_d = req.user) === null || _d === void 0 ? void 0 : _d._id;
        const userJson = yield redis_1.redis.get(userId);
        if (userJson) {
            // calculate user streaks
            const activities = yield activity_1.default
                .find({ userId })
                .sort("-createdAt");
            const user = JSON.parse(userJson);
            res.status(200).json({
                success: true,
                user: Object.assign({}, user),
            });
        }
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.getUserStreak = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.params.id;
        const activities = yield activity_1.default
            .find({ userId })
            .sort("-createdAt")
            .limit(25);
        const userActivity = activities
            .map((activity) => ({
            activityDate: activity.createdAt,
        }))
            .sort((a, b) => a.activityDate.getTime() - b.activityDate.getTime());
        const userStreak = calculateStreak(userActivity);
        res.status(200).json({
            success: true,
            streak: userStreak,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
const calculateStreak = (userActivity) => {
    let currentStreak = 0;
    if (userActivity.length === 0) {
        return currentStreak;
    }
    for (let i = 0; i < userActivity.length; i++) {
        const activityDate = userActivity[i].activityDate.toLocaleDateString();
        if (i > 0) {
            const previousActivityDate = userActivity[i - 1].activityDate.toLocaleDateString();
            if (isNextDay(activityDate, previousActivityDate)) {
                currentStreak += 1;
            }
            else {
                continue;
            }
        }
        else {
            currentStreak;
        }
    }
    return currentStreak;
};
const isNextDay = (date1, date2) => {
    const nextDay = new Date(new Date(date2).getTime() + 86400000).toLocaleDateString();
    return date1 === nextDay;
};
exports.getUser = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { search } = req.query;
        // let queryParams:any = {}
        // if(search){
        //   queryParams.username = { $regex: search, $options: "i" }
        // }
        const users = yield user_model_1.default.find({
            username: { $regex: search, $options: "i" },
        }).select("username name avatar");
        res.status(200).json({
            success: true,
            users,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
// export const sentFriendRequest = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { id } = req.body;
//       const userId = req.user?._id;
//       const friend = await User.findById(id);
//       const user = await User.findById(userId);
//       if (!friend || !user) {
//         return next(new ErrorHandler("user not found!", 401));
//       }
//       if (!!friend.friendRequestReceive.find((friendId) => friendId === id)) {
//         friend.friendRequestReceive = friend?.friendRequestReceive.filter(
//           (friendId) => friendId !== userId
//         );
//         user.friendRequestSent = user?.friendRequestSent.filter(
//           (friendId) => friendId !== id
//         );
//       } else {
//         friend?.friendRequestReceive.push(userId);
//         user?.friendRequestSent.push(id);
//       }
//       await Promise.all([await user.save(), await friend.save()]);
//       res.status(200).json({
//         success: true,
//       });
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 500));
//     }
//   }
// );
exports.followUser = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _e;
    try {
        const { id } = req.body;
        const userId = (_e = req.user) === null || _e === void 0 ? void 0 : _e._id;
        const friend = yield user_model_1.default.findById(id);
        const user = yield user_model_1.default.findById(userId);
        if (!friend || !user) {
            return next(new ErrorHandler_1.default("user not found!", 401));
        }
        if (userId == id) {
            return next(new ErrorHandler_1.default("you cannot follow self", 401));
        }
        console.log({ friend: friend.followers, user: user.following });
        if (!!user.following.find((_id) => id === _id)) {
            res.status(200).json({
                success: true,
                message: "you have already added friend.",
            });
            return;
        }
        friend.followers.push(userId);
        user.following.push(id);
        yield Promise.all([yield user.save(), yield friend.save()]);
        yield (0, notification_1.createNotificationService)({
            userIds: [id],
            from: userId,
            type: notification_1.notificationType.FOLLOW_REQUEST,
            content: "just followed you.",
        });
        yield redis_1.redis.set(user === null || user === void 0 ? void 0 : user._id, JSON.stringify(user));
        res.status(200).json({
            success: true,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.unfollowUser = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _f;
    try {
        const { id } = req.body;
        const userId = (_f = req.user) === null || _f === void 0 ? void 0 : _f._id;
        const friend = yield user_model_1.default.findById(id);
        const user = yield user_model_1.default.findById(userId);
        if (!friend || !user) {
            return next(new ErrorHandler_1.default("user not found!", 401));
        }
        console.log({ friend: friend.followers, user: user.following });
        friend.followers = friend.followers.filter((_id) => _id !== userId);
        user.following = user.following.filter((_id) => _id !== id);
        yield Promise.all([yield user.save(), yield friend.save()]);
        yield redis_1.redis.set(user === null || user === void 0 ? void 0 : user._id, JSON.stringify(user));
        res.status(200).json({
            success: true,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.getFollowing = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _g;
    try {
        const userId = (_g = req.user) === null || _g === void 0 ? void 0 : _g._id;
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return next(new ErrorHandler_1.default("user not found!", 401));
        }
        const followings = yield Promise.all(user.following.map((followingId) => __awaiter(void 0, void 0, void 0, function* () {
            const following = yield user_model_1.default.findById(followingId).select("_id avatar name username");
            return Object.assign({}, following === null || following === void 0 ? void 0 : following._doc);
        })));
        res.status(200).json({
            success: true,
            followings,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
exports.getFollowers = (0, catchAsyncError_1.CatchAsyncError)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _h;
    try {
        const userId = (_h = req.user) === null || _h === void 0 ? void 0 : _h._id;
        const user = yield user_model_1.default.findById(userId);
        if (!user) {
            return next(new ErrorHandler_1.default("user not found!", 401));
        }
        const followers = yield Promise.all(user.followers.map((followerId) => __awaiter(void 0, void 0, void 0, function* () {
            const follower = yield user_model_1.default.findById(followerId).select("_id avatar name username");
            return Object.assign({}, follower === null || follower === void 0 ? void 0 : follower._doc);
        })));
        res.status(200).json({
            success: true,
            followers,
        });
    }
    catch (error) {
        return next(new ErrorHandler_1.default(error.message, 500));
    }
}));
//# sourceMappingURL=user.controller.js.map