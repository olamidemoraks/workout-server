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
exports.authorizeRoles = exports.authorizeUser = void 0;
const ErrorHandler_1 = __importDefault(require("../utils/ErrorHandler"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const redis_1 = require("../utils/redis");
const jwt_1 = require("../utils/jwt");
const authorizeUser = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const access_token = req.cookies.access_token;
    console.log(access_token);
    const refresh_token = req.cookies.refresh_token;
    if (!refresh_token)
        return next(new ErrorHandler_1.default("Please login to access this resource  ", 400));
    try {
        const decoded = jsonwebtoken_1.default.verify(access_token, process.env.ACCESS_TOKEN);
        const user = yield redis_1.redis.get(decoded.id);
        if (!user) {
            return next(new ErrorHandler_1.default("Please login to access this resources ", 400));
        }
        req.user = JSON.parse(user);
        next();
    }
    catch (error) {
        if (!refresh_token) {
            return next(new ErrorHandler_1.default("Access Denied. No refresh token provided.", 400));
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(refresh_token, process.env.REFRESH_TOKEN);
            const session = yield redis_1.redis.get(decoded.id);
            if (!session) {
                return next(new ErrorHandler_1.default("Please login to access this resources ", 400));
            }
            const user = JSON.parse(session);
            req.user = user;
            const accessToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.ACCESS_TOKEN, { expiresIn: "1h" });
            const refreshToken = jsonwebtoken_1.default.sign({ id: user._id }, process.env.REFRESH_TOKEN, { expiresIn: "3d" });
            res.cookie("access_token", accessToken, jwt_1.accessTokenOption);
            res.cookie("refresh_token", refreshToken, jwt_1.refreshTokenOption);
            yield redis_1.redis.set(user._id, JSON.stringify(user), "EX", 604800);
            next();
        }
        catch (error) {
            return next(new ErrorHandler_1.default("Invalid Token.", 400));
        }
    }
});
exports.authorizeUser = authorizeUser;
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        var _a, _b;
        if (!roles.includes(((_a = req.user) === null || _a === void 0 ? void 0 : _a.role) || "")) {
            return next(new ErrorHandler_1.default(`Role: ${(_b = req.user) === null || _b === void 0 ? void 0 : _b.role} is not allowed to access this resources`, 403));
        }
        next();
    };
};
exports.authorizeRoles = authorizeRoles;
//# sourceMappingURL=auth.js.map