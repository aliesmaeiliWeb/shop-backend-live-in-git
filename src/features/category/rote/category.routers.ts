import express from "express";
import { categoryController } from "../controller/category.controller";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { CategoryCreateSchema, CategoryUpdateSchema } from "../schema/category.schema";
import { checkpermission, preventInActiveUser, verifyUser } from "../../../globals/middlewares/auth.middleware";
import { categoryUpload } from "../../../globals/helpers/multer";

const categoryRoute = express.Router();

// Public
categoryRoute.get("/", asyncWrapper(categoryController.getAll.bind(categoryController)));
categoryRoute.get("/:id", asyncWrapper(categoryController.getOne.bind(categoryController)));

// Admin Only
categoryRoute.use(verifyUser);
categoryRoute.use(preventInActiveUser);
categoryRoute.use(checkpermission("ADMIN"));

categoryRoute.post(
  "/",
  categoryUpload.single("imageUrl"),
  validateShema(CategoryCreateSchema),
  asyncWrapper(categoryController.create.bind(categoryController))
);

categoryRoute.put(
  "/:id",
  categoryUpload.single("imageUrl"),
  validateShema(CategoryUpdateSchema),
  asyncWrapper(categoryController.update.bind(categoryController))
);

categoryRoute.delete(
  "/:id",
  asyncWrapper(categoryController.delete.bind(categoryController))
);

export default categoryRoute;