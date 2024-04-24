import { CatchAsyncError } from "../middlewares/catchAsyncError";
import User, { IUser } from "../models/user.model";
import e, { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { Secret } from "jsonwebtoken";
import path from "path";
import ejs from "ejs";
import sendMail from "../utils/sendMail";
import { sendToken } from "../utils/jwt";
import { redis } from "../utils/redis";
import activityModel from "../models/activity";
import cloudinary from "cloudinary";
import {
  createNotificationService,
  notificationType,
} from "../service/notification";

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
      return next(new ErrorHandler(error.message, 405));
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
      return next(new ErrorHandler(error.message, 500));
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

      if (!user?.password) {
        return next(
          new ErrorHandler("Invalid crediential, try with google provider", 401)
        );
      }
      if (!user) {
        return next(new ErrorHandler("Invalid email or password", 404));
      }
      console.log(password);

      const isPasswordCorrect = await user.comparePassword(password);
      console.log({ isPasswordCorrect });
      if (!isPasswordCorrect) {
        return next(new ErrorHandler("Invalid email or password", 404));
      }

      sendToken(user, 200, res);
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
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
      return next(new ErrorHandler(error.message, 500));
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
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const updateUserProfileImage = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.user?._id;
      const user = await User.findById(id);
      const { image } = req.body;

      if (!image) {
        return next(new ErrorHandler("Please provide user image", 400));
      }
      if (user?.avatar?.public_id) {
        await cloudinary.v2.uploader.destroy(user.avatar.public_id);
      }
      const myCloud = await cloudinary.v2.uploader.upload(image, {
        folder: "avatar",
        overwrite: true,
      });

      const avatar = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };

      const updateProfile = await User.findByIdAndUpdate(
        id,
        { avatar },
        {
          new: true,
        }
      );
      await redis.set(user?._id, JSON.stringify(updateProfile));

      console.log({ updateProfile });
      console.log({ avatar });
      res.status(200).json({
        success: true,
        message: "Image successfull changed",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
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
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getUserInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const userJson = await redis.get(userId);
      if (userJson) {
        // calculate user streaks
        const activities = await activityModel
          .find({ userId })
          .sort("-createdAt");

        const user = JSON.parse(userJson as string);
        res.status(200).json({
          success: true,
          user: {
            ...user,
          },
        });
      }
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getUserStreak = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.params.id;
      const activities = await activityModel
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
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
const calculateStreak = (userActivity: { activityDate: Date }[]) => {
  let currentStreak = 0;
  if (userActivity.length === 0) {
    return currentStreak;
  }

  for (let i = 0; i < userActivity.length; i++) {
    const activityDate = userActivity[i].activityDate.toLocaleDateString();

    if (i > 0) {
      const previousActivityDate =
        userActivity[i - 1].activityDate.toLocaleDateString();
      if (isNextDay(activityDate, previousActivityDate)) {
        currentStreak += 1;
      } else {
        continue;
      }
    } else {
      currentStreak;
    }
  }
  return currentStreak;
};

const isNextDay = (date1: string, date2: string) => {
  const nextDay = new Date(
    new Date(date2).getTime() + 86400000
  ).toLocaleDateString();
  return date1 === nextDay;
};

export const getUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { search } = req.query;
      // let queryParams:any = {}
      // if(search){
      //   queryParams.username = { $regex: search, $options: "i" }
      // }

      const users = await User.find({
        username: { $regex: search, $options: "i" },
      }).select("username name avatar");

      res.status(200).json({
        success: true,
        users,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

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
export const followUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      const userId = req.user?._id;
      const friend = await User.findById(id);
      const user = await User.findById(userId);
      if (!friend || !user) {
        return next(new ErrorHandler("user not found!", 401));
      }
      if (userId == id) {
        return next(new ErrorHandler("you cannot follow self", 401));
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

      await Promise.all([await user.save(), await friend.save()]);

      await createNotificationService({
        userIds: [id],
        from: userId,
        type: notificationType.FOLLOW_REQUEST,
        content: "just followed you.",
      });

      await redis.set(user?._id, JSON.stringify(user));
      res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
export const unfollowUser = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.body;
      const userId = req.user?._id;
      const friend = await User.findById(id);
      const user = await User.findById(userId);
      if (!friend || !user) {
        return next(new ErrorHandler("user not found!", 401));
      }

      console.log({ friend: friend.followers, user: user.following });
      friend.followers = friend.followers.filter((_id) => _id !== userId);
      user.following = user.following.filter((_id) => _id !== id);

      await Promise.all([await user.save(), await friend.save()]);

      await redis.set(user?._id, JSON.stringify(user));
      res.status(200).json({
        success: true,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);

export const getFollowing = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("user not found!", 401));
      }

      const followings = await Promise.all(
        user.following.map(async (followingId): Promise<any> => {
          const following = await User.findById(followingId).select(
            "_id avatar name username"
          );
          return {
            ...(following as any)?._doc,
          };
        })
      );

      res.status(200).json({
        success: true,
        followings,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
export const getFollowers = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const user = await User.findById(userId);
      if (!user) {
        return next(new ErrorHandler("user not found!", 401));
      }

      const followers = await Promise.all(
        user.followers.map(async (followerId): Promise<any> => {
          const follower = await User.findById(followerId).select(
            "_id avatar name username"
          );
          return {
            ...(follower as any)?._doc,
          };
        })
      );

      res.status(200).json({
        success: true,
        followers,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 500));
    }
  }
);
