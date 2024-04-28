import { IUser } from "../models/user.model";
import { Response } from "express";
import { redis } from "./redis";
require("dotenv").config();

interface ITokenOptions {
  expires: Date;
  maxAge?: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

export const accessTokenOption: ITokenOptions = {
  expires: new Date(Date.now() + 1 * 60 * 60 * 1000),
  httpOnly: true,
  sameSite: "lax",
  maxAge: 1 * 60 * 60 * 1000,
};
export const refreshTokenOption: ITokenOptions = {
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
  httpOnly: true,
  sameSite: "lax",
  maxAge: 3 * 24 * 60 * 60 * 1000,
};

export const sendToken = (user: IUser, status: number, res: Response) => {
  const accessToken = user.SignAccessToken();
  const refreshToken = user.SignRefreshToken();

  redis.set(user._id, JSON.stringify(user), "EX", 604800);

  // if (process.env.NODE_ENV === "production") {
  //   accessTokenOption.secure = true;
  // }

  // res.cookie("access_token", accessToken, accessTokenOption);
  // res.cookie("refresh_token", refreshToken, refreshTokenOption);

  res.status(200).json({
    success: true,
    user,
    token: accessToken,
  });
};
