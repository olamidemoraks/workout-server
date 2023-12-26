import { CatchAsyncError } from "../middlewares/catchAsyncError";
import User, { IUser } from "../models/user.model";
import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { Secret } from "jsonwebtoken";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import { sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";

export const getAdminActivationCode = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const admin = await User.findOne({ email, role: "admin" });
      if (!admin) {
        return next(new ErrorHandler("User not authorized", 401));
      }

      const activationDetails = createActivationToken(email);
      const activationCode = activationDetails.activationCode;

      const data = { user: { name: email }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mail/admin-code.ejs"),
        data
      );

      try {
        await sendMail({
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
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 401));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 401));
    }
  }
);

export const signInAdmin = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_code, activation_token } = req.body;

      const adminUser: { user: string; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: string; activationCode: string };

      if (activation_code !== adminUser.activationCode) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const email = adminUser.user;

      const user: IUser | null = await User.findOne({ email });
      if (!user) {
        return next(new ErrorHandler("User does not exist", 404));
      }
      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 401));
    }
  }
);

export const registerUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, email, password, username } = req.body;
      const isAlreadyExist = await User.findOne({ email });
      if (isAlreadyExist)
        return next(
          new ErrorHandler("An Account has been created with this email", 400)
        );
      const user = {
        name,
        email,
        password,
        username,
      };
      const activationDetails = createActivationToken(user);
      const activationCode = activationDetails.activationCode;
      const data = { user: { name: user.name }, activationCode };
      const html = await ejs.renderFile(
        path.join(__dirname, "../mail/activation-mail.ejs"),
        data
      );

      try {
        await sendMail({
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
      } catch (error: any) {
        return next(new ErrorHandler(error.message, 401));
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 401));
    }
  }
);

export const activateUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { activation_code, activation_token } = req.body;

      const newUser: { user: IUser; activationCode: string } = jwt.verify(
        activation_token,
        process.env.ACTIVATION_SECRET as string
      ) as { user: IUser; activationCode: string };

      if (activation_code !== newUser.activationCode) {
        return next(new ErrorHandler("Invalid activation code", 400));
      }

      const { name, email, password, username } = newUser.user;

      const existUser = await User.findOne({ email });
      if (existUser) {
        return next(
          new ErrorHandler("Email already exist, please proceed to login", 400)
        );
      }

      const user = await User.create({
        name,
        email,
        password,
        username,
        steps: "gender",
        isVerified: true,
      });

      sendToken(user, 200, res);
      // res.status(201).json({ success: true });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const loginUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return next(new ErrorHandler("Please enter email or password", 400));
      }
      const user = await User.findOne({ email }).select("+password");
      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 404));
      }
      console.log(password);

      const isPasswordCorrect = await user.comparePassword(password);
      if (!isPasswordCorrect) {
        return next(new ErrorHandler("Invalid email or password", 404));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const socialAuth = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, username } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        const newUser = await User.create({
          email,
          name,
          username,
          isVerified: true,
        });
        sendToken(newUser, 200, res);
      } else {
        sendToken(user, 200, res);
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const checkUserExist = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        res.status(200).json({
          success: false,
        });
      } else {
        res.status(200).json({
          success: true,
        });
      }
    } catch (error) {}
  }
);

interface IActivationToken {
  token: string;
  activationCode: string;
}

const createActivationToken = (user: any): IActivationToken => {
  const activationCode = Math.floor(100 * Math.random() * 9000).toString();
  console.log(activationCode);
  const token = jwt.sign(
    { user, activationCode },
    process.env.ACTIVATION_SECRET as Secret,
    { expiresIn: "5m" }
  );

  return {
    token,
    activationCode,
  };
};

export const updateUserProfile = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user;
      const profile = await User.findByIdAndUpdate(
        { _id: user?._id },
        { ...req.body },
        { new: true }
      );

      await redis.set(user?._id, JSON.stringify(profile));

      res.status(200).json({
        success: true,
        user: profile,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const logoutUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.cookie("access_token", "", { maxAge: 1 }),
        res.cookie("refresh_token", "", { maxAge: 1 });
      console.log("Logout");
      const userId = req.user?._id || "";
      redis.del(userId);

      res.status(200).json({
        success: true,
        message: "Logged out successfully",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const userJson = await redis.get(userId);
      if (userJson) {
        const user = JSON.parse(userJson as string);
        res.status(200).json({
          success: true,
          user,
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
