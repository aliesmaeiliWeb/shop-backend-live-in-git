import express from "express";
import { couponController } from "../controller/coupon.controller";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import {
  createCouponSchema,
  updateCouponSchema,
} from "../schema/coupon.schema";
import {
  checkpermission,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";

const couponRoute = express.Router();

couponRoute.use(verifyUser, checkpermission("Admin", "Shop_Manager"));

couponRoute.post(
  "/",
  validateShema(createCouponSchema),
  asyncWrapper(couponController.create.bind(couponController))
);

couponRoute.get(
  "/",
  asyncWrapper(couponController.getAll.bind(couponController))
);

couponRoute.get(
  "/:id",
  asyncWrapper(couponController.getOne.bind(couponController))
);

couponRoute.patch(
  "/:id",
  validateShema(updateCouponSchema),
  asyncWrapper(couponController.update.bind(couponController))
);

couponRoute.delete(
  "/:id",
  asyncWrapper(couponController.delete.bind(couponController))
);

export default couponRoute;
