"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const user_controller_1 = require("../controllers/user.controller");
const auth_1 = require("../middlewares/auth");
const userRouters = express_1.default.Router();
userRouters.post("/admin-activation-code", user_controller_1.getAdminActivationCode);
userRouters.post("/signin-admin", user_controller_1.signInAdmin);
userRouters.post("/register-user", user_controller_1.registerUser);
userRouters.post("/login-user", user_controller_1.loginUser);
userRouters.post("/activate-user", user_controller_1.activateUser);
userRouters.post("/check-user", user_controller_1.checkUserExist);
userRouters.post("/social-auth", user_controller_1.socialAuth);
userRouters.put("/update-profile", auth_1.authorizeUser, user_controller_1.updateUserProfile);
userRouters.put("/update-profile-image", auth_1.authorizeUser, user_controller_1.updateUserProfileImage);
userRouters.get("/user-info", auth_1.authorizeUser, user_controller_1.getUserInfo);
userRouters.get("/get-streak/:id", auth_1.authorizeUser, user_controller_1.getUserStreak);
userRouters.post("/logout", user_controller_1.logoutUser);
userRouters.get("/find-user", user_controller_1.getUser);
userRouters.put("/follow-user", auth_1.authorizeUser, user_controller_1.followUser);
userRouters.put("/unfollow-user", auth_1.authorizeUser, user_controller_1.unfollowUser);
userRouters.get("/get-following", auth_1.authorizeUser, user_controller_1.getFollowing);
userRouters.get("/get-follower", auth_1.authorizeUser, user_controller_1.getFollowers);
exports.default = userRouters;
//# sourceMappingURL=user.route.js.map