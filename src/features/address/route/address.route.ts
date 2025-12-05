import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { addressController } from "../controller/address.controller";
import { verifyUser, preventInActiveUser } from "../../../globals/middlewares/auth.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { addressSchema } from "../schema/address.schema";

const addressRouter = express.Router();

// تمام روت‌های آدرس نیاز به لاگین دارند
addressRouter.use(verifyUser);
addressRouter.use(preventInActiveUser);


addressRouter.get(
  "/", 
  asyncWrapper(addressController.getMyAddresses.bind(addressController))
);


addressRouter.post(
  "/",
  validateShema(addressSchema),
  asyncWrapper(addressController.addAddress.bind(addressController))
);


addressRouter.put(
  "/:id",
  validateShema(addressSchema),
  asyncWrapper(addressController.updateAddress.bind(addressController))
);


addressRouter.delete(
  "/:id",
  asyncWrapper(addressController.deleteAddress.bind(addressController))
);

export default addressRouter;