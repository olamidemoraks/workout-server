"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
require("dotenv").config();
const express_1 = __importDefault(require("express"));
exports.app = (0, express_1.default)();
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const morgan_1 = __importDefault(require("morgan"));
const user_route_1 = __importDefault(require("./routes/user.route"));
const error_1 = require("./middlewares/error");
const exercise_route_1 = __importDefault(require("./routes/exercise.route"));
const workout_route_1 = __importDefault(require("./routes/workout.route"));
const activity_route_1 = __importDefault(require("./routes/activity.route"));
const challenge_route_1 = __importDefault(require("./routes/challenge.route"));
const category_route_1 = __importDefault(require("./routes/category.route"));
const custom_workout_route_1 = __importDefault(require("./routes/custom.workout.route"));
const notification_route_1 = __importDefault(require("./routes/notification.route"));
exports.app.use(express_1.default.json({ limit: "50mb" }));
exports.app.use((0, morgan_1.default)("common"));
//cookie parser
exports.app.use((0, cookie_parser_1.default)(process.env.ACCESS_TOKEN));
//cor
exports.app.use((0, cors_1.default)({
    origin: [
        "http://localhost:3000",
        "http://localhost:3001",
        `${process.env.CLIENT_API}`,
    ],
    credentials: true,
}));
exports.app.use("/api/v1", user_route_1.default, exercise_route_1.default, workout_route_1.default, activity_route_1.default, challenge_route_1.default, category_route_1.default, custom_workout_route_1.default, notification_route_1.default);
exports.app.get("/", (req, res, next) => {
    res.status(200).json({
        success: true,
        message: "Api is working",
    });
});
exports.app.all("*", (req, res, next) => {
    const err = new Error(`Route ${req.originalUrl} not found`);
    err.statusCode = 404;
    next(err);
});
exports.app.use(error_1.ErrorMiddleware);
//# sourceMappingURL=app.js.map