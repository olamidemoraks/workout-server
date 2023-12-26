import Exercise from "../models/exercise.model";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import { Response, Request, NextFunction } from "express";
import ErrorHandler from "../utils/ErrorHandler";
import cloudinary from "cloudinary";

export const createExercise = CatchAsyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { name, image, female_image, instruction_video } = req.body;
    const isExerciseNameExist = await Exercise.findOne({ name });
    if (isExerciseNameExist)
      return next(
        new ErrorHandler(
          "Name has been used. Please use another exercise name",
          400
        )
      );
    if (image) {
      const myCloud = await cloudinary.v2.uploader.upload(image, {
        folder: "exercise_image",
        overwrite: true,
      });
      req.body.image = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    if (female_image) {
      const myCloud = await cloudinary.v2.uploader.upload(female_image, {
        folder: "exercise_image",
        overwrite: true,
      });
      req.body.female_image = {
        public_id: myCloud.public_id,
        url: myCloud.secure_url,
      };
    }
    // if (instruction_video) {
    //   const myCloud = await cloudinary.v2.uploader.upload(instruction_video, {
    //     resource_type: "video",
    //     folder: "exercise_video",
    //   });
    //   req.body.instruction_video = {
    //     public_id: myCloud.public_id,
    //     url: myCloud.secure_url,
    //   };
    // }

    const exercise = await Exercise.create({ ...req.body });

    res.status(201).json({
      success: true,
      message: "Exercise created",
      exercise,
    });
  } catch (error: any) {
    return next(new ErrorHandler(error.message, 400));
  }
});

export const updateExercise = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const { name, image, female_image, instruction_video } = req.body;
      const nameExist = await Exercise.find({ name });
      const isExist = nameExist.filter((item) => item._id.toString() !== id);
      if (isExist.length > 0) {
        return next(
          new ErrorHandler(
            "Name has been used. Please use another exercise name.",
            400
          )
        );
      }
      const exercise = await Exercise.findById(id);
      console.log(exercise);
      if (!exercise) {
        return next(new ErrorHandler("Exercise doesn't exist.", 404));
      }

      if (typeof image === "string") {
        await cloudinary.v2.uploader.destroy(exercise.image.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "exercise_image",
        });
        req.body.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }
      if (typeof female_image === "string") {
        await cloudinary.v2.uploader.destroy(exercise.female_image.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(female_image, {
          folder: "exercise_female_image",
        });
        req.body.female_image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      const updatedExercise = await Exercise.findByIdAndUpdate(
        { _id: id },
        req.body,
        { new: true }
      );

      res.status(200).json({
        success: true,
        message: "Exercise updated",
        exercise: updatedExercise,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const deleteExercise = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const exercise = await Exercise.findByIdAndDelete(id);
      res.status(200).json({
        success: true,
        message: `${exercise?.name} deleted`,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getExercises = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const exercises = await Exercise.find({}).sort("-createdAt");
      res.status(200).json({
        success: true,
        exercises,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getExercise = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const exercise = await Exercise.findById(id);
      if (!exercise) {
        return next(new ErrorHandler("Exercise doesn't exist.", 404));
      }
      res.status(200).json({
        success: true,
        exercise,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
