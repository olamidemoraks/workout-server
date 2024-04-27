"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendToken = exports.refreshTokenOption = exports.accessTokenOption = void 0;
const redis_1 = require("./redis");
require("dotenv").config();
exports.accessTokenOption = {
    expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "lax",
    maxAge: 1 * 60 * 60 * 1000,
};
exports.refreshTokenOption = {
    expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "lax",
    maxAge: 3 * 24 * 60 * 60 * 1000,
};
const sendToken = (user, status, res) => {
    const accessToken = user.SignAccessToken();
    const refreshToken = user.SignRefreshToken();
    redis_1.redis.set(user._id, JSON.stringify(user), "EX", 604800);
    if (process.env.NODE_ENV === "production") {
        exports.accessTokenOption.secure = true;
    }
    res.cookie("access_token", accessToken, exports.accessTokenOption);
    res.cookie("refresh_token", refreshToken, exports.refreshTokenOption);
    res.status(200).json({
        success: true,
        user,
    });
};
exports.sendToken = sendToken;
//# sourceMappingURL=jwt.js.map