import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { productController } from "../controller/product.controller";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { productSchema } from "../schema/product.schema";

const productRoute = express.Router();

productRoute.post(
  "/",
  validateShema(productSchema),
  asyncWrapper(productController.create)
);
productRoute.get("/", asyncWrapper(productController.read));
productRoute.get("/:id", asyncWrapper(productController.readOne));
productRoute.put(
  "/:id",
  validateShema(productSchema),
  asyncWrapper(productController.update)
);
productRoute.delete("/:id", asyncWrapper(productController.delete));

export default productRoute;
