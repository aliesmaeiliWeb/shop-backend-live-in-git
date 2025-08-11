import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { productController } from "../controller/product.controller";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { productSchema } from "../schema/product.schema";
import {
  checkpermission,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";
import { upload } from "../../../globals/helpers/multer";

const productRoute = express.Router();

productRoute.post(
  "/",
  verifyUser,
  upload.single('main_Image'),
  checkpermission("Shop", "Admin"),
  validateShema(productSchema),
  asyncWrapper(productController.create)
);
productRoute.get("/", asyncWrapper(productController.read));
productRoute.get("/:id", asyncWrapper(productController.readOne));
productRoute.put(
  "/:id",
  verifyUser,
  upload.single('main_Image'),
  checkpermission("Shop", "Admin"),
  validateShema(productSchema),
  asyncWrapper(productController.update)
);
productRoute.delete(
  "/:id",
  verifyUser,
  checkpermission("Shop", "Admin"),
  asyncWrapper(productController.delete)
);
productRoute.get(
  "/my",
  verifyUser,
  asyncWrapper(productController.readMyProducts)
);

export default productRoute;
