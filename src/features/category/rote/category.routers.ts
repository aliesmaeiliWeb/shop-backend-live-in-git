import express from "express";
import { categoryController } from "../controller/category.controller";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { CategorySchema } from "../schema/category.schema";
import multer from "multer";
import path from "path";
import {
  checkpermission,
  preventInActiveUser,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";
import { categoryUpload } from "../../../globals/helpers/multer";

const categoryRoute = express.Router();
//+ every users can do this action
categoryRoute.get("/", asyncWrapper(categoryController.getAll));
categoryRoute.get("/:id", asyncWrapper(categoryController.get));

//+ only verify user and user active and admin 
categoryRoute.use(verifyUser);
categoryRoute.use(checkpermission("Admin"));
categoryRoute.use(preventInActiveUser);

categoryRoute.post(
  "/",
  categoryUpload.single("imageUrl"),
  validateShema(CategorySchema),
  asyncWrapper(categoryController.create)
);
categoryRoute.put(
  "/:id",
  categoryUpload.single("imageUrl"),
  validateShema(CategorySchema),
  asyncWrapper(categoryController.update)
);
categoryRoute.delete("/:id", asyncWrapper(categoryController.delete));
categoryRoute.get(
  "/:id/attributes",
  asyncWrapper(categoryController.getAttribute)
);
export default categoryRoute;
