import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { addressController } from "../controller/address.controller";
import { verifyUser } from "../../../globals/middlewares/auth.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { addressSchema } from "../schema/address.schema";

const addressRouter = express.Router();

addressRouter.use(verifyUser);

addressRouter.post(
  "/",
  validateShema(addressSchema),
  asyncWrapper(addressController.addAddress.bind(addressController))
);
addressRouter.delete(
  "/:id",
  asyncWrapper(addressController.delete.bind(addressController))
);
addressRouter.put(
  "/:id",
  validateShema(addressSchema),
  asyncWrapper(addressController.updateAddress.bind(addressController))
);

addressRouter.get('/me', asyncWrapper(addressController.getMyAddress))

export default addressRouter;
