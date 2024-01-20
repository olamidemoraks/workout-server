import express from "express";
import { authorizeRoles, authorizeUser } from "../middlewares/auth";
import {
  createCategory,
  deleteCategory,
  getAllCategory,
  getCategory,
  updateCategory,
} from "../controllers/category.controller";

const categoryRouter = express.Router();

categoryRouter.post(
  "/create-category",
  authorizeUser,
  authorizeRoles("admin"),
  createCategory
);
categoryRouter.get("/get-all-category", getAllCategory);
categoryRouter.get(
  "/get-category/:id",
  authorizeUser,
  authorizeRoles("admin"),
  getCategory
);
categoryRouter.put(
  "/edit-category/:id",
  authorizeUser,
  authorizeRoles("admin"),
  updateCategory
);
categoryRouter.delete(
  "/delete-category/:id",
  authorizeUser,
  authorizeRoles("admin"),
  deleteCategory
);

export default categoryRouter;
