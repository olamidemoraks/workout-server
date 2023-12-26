import express from "express";
import {
  activateUser,
  checkUserExist,
  getAdminActivationCode,
  getUserInfo,
  loginUser,
  logoutUser,
  registerUser,
  signInAdmin,
  socialAuth,
  updateUserProfile,
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

userRouters.get("/user-info", authorizeUser, getUserInfo);

userRouters.get("/logout", authorizeUser, logoutUser);
export default userRouters;
