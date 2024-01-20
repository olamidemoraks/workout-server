import { NextFunction, Request, Response } from "express";
import { CatchAsyncError } from "../middlewares/catchAsyncError";
import ErrorHandler from "../utils/ErrorHandler";
import Category from "../models/category.model";
import cloudinary from "cloudinary";

export const createCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, image } = req.body;
      const categoryNameExist = await Category.findOne({ title });
      if (categoryNameExist) {
        return next(
          new ErrorHandler(
            `${title} category already exist, try another! `,
            400
          )
        );
      }
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

      const category = await Category.create(req.body);
      res.status(201).json({
        success: true,
        category,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getAllCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await Category.find({});
      res.status(200).json({
        success: true,
        categories,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const getCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const category = await Category.findById(id);
      if (!category) {
        return next(new ErrorHandler("Category does not exist", 400));
      }
      res.status(200).json({
        success: true,
        category,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const updateCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const { image } = req.body;
      const category = await Category.findById(id);
      if (!category) {
        return next(new ErrorHandler("Category does not exist", 400));
      }

      if (typeof image !== "object") {
        await cloudinary.v2.uploader.destroy(category?.image?.public_id);
        const myCloud = await cloudinary.v2.uploader.upload(image, {
          folder: "challenge_image",
          overwrite: true,
        });
        req.body.image = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

      await Category.findByIdAndUpdate(id, { ...req.body }, { new: true });

      res.status(200).json({
        success: true,
        message: `${category.title} updated successful`,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);

export const deleteCategory = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const category = await Category.findById(id);
      if (!category) {
        return next(new ErrorHandler("Category does not exist", 400));
      }
      await Category.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: `${category.title} deleted successful`,
      });
    } catch (error: any) {
      return next(new ErrorHandler(error.message, 400));
    }
  }
);
