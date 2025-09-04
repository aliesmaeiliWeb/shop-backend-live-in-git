import express, { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { productController } from "../controller/product.controller";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { productSchema, updateProductSchema } from "../schema/product.schema";
import {
  checkpermission,
  preventInActiveUser,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";
import { upload } from "../../../globals/helpers/multer";
import parseDynamicAttribute from "../../../globals/middlewares/productChange.middleware";
import { commentRoute } from "../../comment/route/comment.route";

const productRoute = express.Router();
productRoute.get("/", asyncWrapper(productController.getAll));
productRoute.get(
  "/:id",
  asyncWrapper(productController.readOne.bind(productController))
);

//+ after login
productRoute.use(verifyUser);
productRoute.get(
  "/my",
  verifyUser,
  asyncWrapper(productController.readMyProducts.bind(productController))
);

productRoute.use("/:productId/comments", commentRoute);

productRoute.use(checkpermission("Shop", "Admin"));
productRoute.use(preventInActiveUser);

productRoute.post(
  "/",
  upload.array("main_Image", 15),
  parseDynamicAttribute,
  validateShema(productSchema),
  asyncWrapper(productController.createBaseProduct.bind(productController))
);
productRoute.patch(
  "/:id",
  upload.array("main_Image", 15),
  validateShema(updateProductSchema),
  parseDynamicAttribute,
  asyncWrapper(productController.update.bind(productController))
);
productRoute.delete(
  "/:id",
  asyncWrapper(productController.delete.bind(productController))
);
productRoute.delete(
  "/:productId/images",
  asyncWrapper(productController.deleteImage.bind(productController))
);

//+ SKU route
productRoute.post(
  "/:id/sku",
  asyncWrapper(productController.addSku.bind(productController))
);
productRoute.patch(
  "/skus/:skuId",
  asyncWrapper(productController.editSku.bind(productController))
);
productRoute.delete(
  "/skus/:skuId",
  asyncWrapper(productController.removeSku.bind(productController))
);
export default productRoute;
