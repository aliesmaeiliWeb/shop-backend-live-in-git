import express from "express";
import { categoryController } from "../controller/category.controller";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { CategorySchema } from "../schema/category.schema";

const categoryRoute = express.Router();

categoryRoute.post(
  "/",
  validateShema(CategorySchema),
  asyncWrapper(categoryController.create)
);
categoryRoute.get("/", asyncWrapper(categoryController.getAll));
categoryRoute.get('/:id', asyncWrapper(categoryController.get));
categoryRoute.put('/:id', asyncWrapper(categoryController.update));
categoryRoute.delete('/:id', asyncWrapper(categoryController.delete));
categoryRoute.get('/:id/attributes', asyncWrapper(categoryController.getAttribute));
export default categoryRoute;
