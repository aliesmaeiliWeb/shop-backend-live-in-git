import express, { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { productController } from "../controller/product.controller";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { productSchema } from "../schema/product.schema";
import {
  checkpermission,
  preventInActiveUser,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";
import { upload } from "../../../globals/helpers/multer";
import parseDynamicAttribute from "../../../globals/middlewares/productChange.middleware";
import { commentRoute } from "../../comment/route/comment.route";

const productRoute = express.Router();
productRoute.get("/", asyncWrapper(productController.read));
productRoute.get("/my", verifyUser, asyncWrapper(productController.readMyProducts));
productRoute.get("/:id", asyncWrapper(productController.readOne));

productRoute.use(verifyUser);
productRoute.use(checkpermission("Shop", "Admin"));
productRoute.use(preventInActiveUser);

productRoute.post(
  "/",
  upload.array("main_Image", 15),
  parseDynamicAttribute,
  validateShema(productSchema),
  asyncWrapper(productController.create)
);
productRoute.put(
  "/:id",
  upload.array("main_Image", 15),
  parseDynamicAttribute,
  validateShema(productSchema),
  asyncWrapper(productController.update)
);
productRoute.delete("/:id", asyncWrapper(productController.delete));
productRoute.delete(
  "/:productId/images",
  asyncWrapper(productController.deleteImage)
);

productRoute.use("/:productId/comments", commentRoute);

export default productRoute;
