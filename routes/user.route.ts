import express from "express";
import {
  activateUser,
  checkUserExist,
  followUser,
  getAdminActivationCode,
  getFollowers,
  getFollowing,
  getProfileInfo,
  getUser,
  getUserInfo,
  getUserStreak,
  loginUser,
  logoutUser,
  registerUser,
  signInAdmin,
  socialAuth,
  unfollowUser,
  updateUserProfile,
  updateUserProfileImage,
} from "../controllers/user.controller";
import { authorizeUser } from "../middlewares/auth";

const userRouters = express.Router();

userRouters.post("/admin-activation-code", getAdminActivationCode);
userRouters.post("/signin-admin", signInAdmin);

userRouters.post("/register-user", registerUser);
userRouters.post("/login-user", loginUser);
userRouters.post("/activate-user", activateUser);

userRouters.post("/check-user", checkUserExist);

userRouters.post("/social-auth", socialAuth);

userRouters.put("/update-profile", authorizeUser, updateUserProfile);
userRouters.put("/update-profile-image", authorizeUser, updateUserProfileImage);

userRouters.get("/user-info", authorizeUser, getUserInfo);
userRouters.get("/profile-info/:id", authorizeUser, getProfileInfo);

userRouters.get("/get-streak/:id", authorizeUser, getUserStreak);

userRouters.post("/logout", logoutUser);

userRouters.get("/find-user", getUser);

userRouters.put("/follow-user", authorizeUser, followUser);

userRouters.put("/unfollow-user", authorizeUser, unfollowUser);

userRouters.get("/get-following", authorizeUser, getFollowing);

userRouters.get("/get-follower", authorizeUser, getFollowers);
export default userRouters;
