import express, { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { productVariantItemController } from "../controller/item-variant.controller";
import {
  checkpermission,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";

const productVariantItemRoute = express.Router();

productVariantItemRoute.use(verifyUser);
productVariantItemRoute.use(checkpermission("Admin"));

productVariantItemRoute.post(
  "/:productId/:variantId",
  asyncWrapper(
    productVariantItemController.addItem
  )
);
productVariantItemRoute.delete(
  "/:productId/:variantId/:variantItemId",
  asyncWrapper(
    productVariantItemController.delete
  )
);

export default productVariantItemRoute;
