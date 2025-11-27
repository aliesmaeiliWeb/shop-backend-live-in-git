import express from "express";
import { productController } from "../controller/product.controller";
import { productUpload } from "../../../globals/helpers/multer";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { productCreateSchema, productUpdateSchema } from "../schema/product.schema";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import {
  checkpermission,
  preventInActiveUser,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";

const productRoute = express.Router();

productRoute.get("/", asyncWrapper(productController.getAll.bind(productController)));
productRoute.get("/:id", asyncWrapper(productController.getOne.bind(productController)));

productRoute.use(verifyUser);
productRoute.use(preventInActiveUser);
productRoute.use(checkpermission("ADMIN")); 

productRoute.post(
  "/",
  productUpload.fields([
    { name: "mainImage", maxCount: 1 },
    { name: "galleryImages", maxCount: 5 },
  ]),
  (req, res, next) => {
    if (req.body.skus && typeof req.body.skus === "string") {
      try { req.body.skus = JSON.parse(req.body.skus); } catch (e) {}
    }
    if (req.body.attributeValueIds && typeof req.body.attributeValueIds === "string") {
      try { req.body.attributeValueIds = JSON.parse(req.body.attributeValueIds); } catch (e) {}
    }
    next();
  },
  validateShema(productCreateSchema),
  asyncWrapper(productController.create.bind(productController))
);


productRoute.put(
  "/:id",
  productUpload.fields([{ name: "mainImage", maxCount: 1 }]),
  validateShema(productUpdateSchema),
  asyncWrapper(productController.update.bind(productController))
);

productRoute.delete(
  "/:id",
  asyncWrapper(productController.delete.bind(productController))
);

productRoute.post(
  "/:id/gallery",
  productUpload.array("galleryImages", 5),
  asyncWrapper(productController.addGalleryImages.bind(productController))
);

productRoute.delete(
  "/gallery/:galleryId",
  asyncWrapper(productController.deleteGalleryImage.bind(productController))
);

productRoute.post(
  "/:id/sku",
  asyncWrapper(productController.addSku.bind(productController))
);

export default productRoute;