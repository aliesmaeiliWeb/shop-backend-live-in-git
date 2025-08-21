import express, { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { productVariantController } from "../controller/controller.variant.controller";
import {
  checkpermission,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";

const productVariantRoute = express.Router();

productVariantRoute.use(verifyUser);
productVariantRoute.use(checkpermission("Admin", "Shop"));

productVariantRoute.post(
  "/:productId",
  asyncWrapper(
    productVariantController.addVariant.bind(productVariantController)
  )
);

productVariantRoute.delete(
  "/:productId/:variantId",
  asyncWrapper(productVariantController.delete.bind(productVariantController))
);

export default productVariantRoute;
