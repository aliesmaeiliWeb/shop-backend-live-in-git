import express, { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { productController } from "../controller/product.controller";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { productSchema } from "../schema/product.schema";
import {
  checkpermission,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";
import { upload } from "../../../globals/helpers/multer";
import parseDynamicAttribute from "../../../globals/middlewares/productChange.middleware";

//! mock
interface FakeUserPayload {
  id: number;
  role: string;
}

const mockUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.currentUser = {
    id: 18,
    role: "Admin",
    email: "shop3@gmail.com",
    name: "Test",
    lastName: "User",
    avatar: 'alikcatar'
  };
  next();
};

const productRoute = express.Router();

productRoute.post(
  "/",
  // verifyUser,
  mockUserMiddleware,
  upload.array("main_Image", 15),
  parseDynamicAttribute,
  checkpermission("Shop", "Admin"),
  validateShema(productSchema),
  asyncWrapper(productController.create)
);
productRoute.get("/", asyncWrapper(productController.read));
productRoute.get("/:id", asyncWrapper(productController.readOne));
productRoute.put(
  "/:id",
  mockUserMiddleware,
  // verifyUser,
  upload.array("main_Image", 15),
  parseDynamicAttribute,
  checkpermission("Shop", "Admin"),
  validateShema(productSchema),
  asyncWrapper(productController.update)
);
productRoute.delete(
  "/:id",
  // verifyUser,
  checkpermission("Shop", "Admin"),
  asyncWrapper(productController.delete)
);
productRoute.get(
  "/my",
  // verifyUser,
  asyncWrapper(productController.readMyProducts)
);
productRoute.delete(
  "/:productId/images",
  asyncWrapper(productController.deleteImage)
)

export default productRoute;
