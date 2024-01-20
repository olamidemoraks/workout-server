import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import challengeModel from "../models/challenge.model";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";
import Exercise from "../models/exercise.model";
import ChallengProgress from "../models/challengeProgress.model";
import activityModel from "../models/activity";
import cron from "node-cron";
import userModel from "../models/user.model";
import { redis } from "../utils/redis";

export const createChallenges = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { image } = req.body;
      if (image) {
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "challenge_image",
          overwrite: true,
        });
        req.body.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const challenge = await challengeModel.create({
        ...req.body,
      });
      res.status(201).json({
        success: true,
        challenge,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updateChallenges = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { image } = req.body;
      const challenge = await challengeModel.findById(id);

      if (!challenge) {
        return next(new ErrorHandler("Workout doesn't exist", 404));
      }

      if (typeof image === "string") {
        await cloudinary.v2.uploader.destroy(challenge?.image?.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "challenge_image",
        });
        req.body.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const updatedChallenge = await challengeModel.findByIdAndUpdate(
        { _id: id },
        req.body,
        { new: true }
      );
      res.status(200).json({
        success: true,
        message: "Challenge Updated",
        challenge: updatedChallenge,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllChallenges = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const challenges = await challengeModel
        .find()
        .select("name days image premium title location");

      res.status(200).json({
        success: true,
        challenges,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
export const deleteChallenges = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const challenge = await challengeModel.findById(id);
      if (!challenge) {
        return next(new ErrorHandler("Workout doesn't exist", 404));
      }
      await cloudinary.v2.uploader.destroy(challenge?.image?.public_id);
      await challengeModel.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Delete Successfull",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getChallenge = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const challenge = await challengeModel.findById(id);

      const challenges = await Promise.all(
        challenge!.challenges.map(async (workouts: any[]) => {
          const challengeWorkout = await Promise.all(
            workouts.map(async (workout) => {
              const exercise = await Exercise.findOne({
                _id: workout.exercise_id,
              }).select("name image");
              return {
                ...(exercise as any)?._doc,
                ...(workout as any)?._doc,
              };
            })
          );
          return [...challengeWorkout];
        })
      );

      const challengesWithWorkout = {
        ...(challenge as any)?._doc,
      };

      challengesWithWorkout.challenges = challenges;

      res.status(200).json({
        success: true,
        challenge: challengesWithWorkout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getFrontalChallenge = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const challenges = await challengeModel
        .find()
        .select("name days image premium title location");

      const challengeUserprogress = await Promise.all(
        challenges.map(async (challenge) => {
          const challengeProgess = await ChallengProgress.findOne({
            challengeId: challenge._id,
            userId,
          });
          return {
            ...(challenge as any)?._doc,
            progress: challengeProgess?.day ?? null,
          };
        })
      );

      res.status(200).json({
        success: true,
        challenges: challengeUserprogress,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getCurrentChallenge = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?._id;
      const userProgressChallenge = await ChallengProgress.find({ userId });

      const userCurrentChallenge = await Promise.all(
        userProgressChallenge.map(async (progress) => {
          const userChallenge = await challengeModel
            .findById(progress.challengeId)
            .select("name days image premium title location");
          return {
            ...(userChallenge as any)?._doc,
            progress: progress?.day ?? null,
          };
        })
      );

      res.status(200).json({
        success: true,
        challenges: userCurrentChallenge,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getChallengeInfo = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      const challenge = await challengeModel
        .findById(id)
        .select("name days image premium title location");

      const userProgress = await ChallengProgress.findOne({
        challengeId: id,
        userId,
      });

      res.status(200).json({
        success: true,
        challenge,
        currentDay: userProgress?.day ?? 1,
        isCompleted: userProgress?.isCompleted ?? false,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const startChallenge = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const userId = req.user?._id;
      const challenge = await challengeModel.findById(id);

      const userProgress = await ChallengProgress.findOne({
        challengeId: id,
        userId,
      });

      const currentChallenge = challenge?.challenges[userProgress?.day ?? 0];

      const exercises = await Promise.all(
        currentChallenge!.map(async (value: any) => {
          const exercise = await Exercise.findOne({ _id: value.exercise_id });
          return {
            ...(exercise as any)?._doc,
            ...(value as any)?._doc,
          };
        })
      );

      const workout = {
        image: challenge?.image,
        name: challenge?.title,
        _id: challenge?._id,
        exercises,
      };

      res.status(200).json({
        success: true,
        workout,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

// export const createChallengeProgress = CatchAsyncError(
//   async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { challengeId } = req.body;
//       const userId = req.user?._id;
//       const progress = await ChallengProgress.findOne({ challengeId, userId });
//       if (!progress) {
//         await ChallengProgress.create({ challengeId, userId });
//         res.status(201).json({
//           success: true,
//           message: "progress created",
//         });
//       }
//     } catch (error: any) {
//       return next(new ErrorHandler(error.message, 400));
//     }
//   }
// );

export const completedChallenge = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { challengeId, workoutName, totalTime, weight } = req.body;
      const userId = req.user?._id;

      if (totalTime < 60) {
        return next(new ErrorHandler("total time less than 1 sec", 400));
      }

      const progress = await ChallengProgress.findOne({ challengeId, userId });

      const challengeData = {
        challengeId,
        isCompleted: true,
        userId,
      };

      const activityData = {
        workoutName,
        userId,
        totalTime,
      };

      if (req.user?.weight !== weight) {
        const data = {
          weight,
          weightHistory: req.user?.weightHistory,
        };
        data.weightHistory?.push({
          weight: weight,
          createdAt: new Date(),
        });

        const user = await userModel.findByIdAndUpdate(req.user?._id, data, {
          new: true,
        });
        await redis.set(req.user?._id, JSON.stringify(user));
      }

      if (!progress) {
        await ChallengProgress.create(challengeData);
      } else {
        await ChallengProgress.findByIdAndUpdate(
          challengeId,
          {
            $set: challengeData,
          },
          { new: true }
        );
      }
      await activityModel.create(activityData);

      res.status(201).json({
        success: true,
        message: "progress updated",
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

cron.schedule("0 3 * * 1-7", async function () {
  const oneDayAgo = new Date(Date.now() - 1 * 24 * 60 * 1000);
  await ChallengProgress.updateMany(
    {
      isCompleted: true,
      updatedAt: { $lt: oneDayAgo },
    },
    {
      $inc: { day: 1 },
    }
  );
  console.log("Cron job update");
});
