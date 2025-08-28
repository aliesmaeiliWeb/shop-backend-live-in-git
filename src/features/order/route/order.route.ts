import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { orderController } from "../controller/order.controller";
import { verifyUser } from "../../../globals/middlewares/auth.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { createOrderSchema } from "../schema/order.schema";

const orderRouter = express.Router();

//+ callback address for payment zarinpal => global
orderRouter.get(
  "/payment/callback",
  asyncWrapper(orderController.verifyPaymentCallBack.bind(orderController))
);

orderRouter.use(verifyUser);

//+ create new orders for pendign status
orderRouter.post(
  "/",
  validateShema(createOrderSchema),
  asyncWrapper(orderController.create.bind(orderController))
);

//+ cancell pendign for user
orderRouter.patch(
  "/:id/cancel",
  asyncWrapper(orderController.cancel.bind(orderController))
);

//+ start payment  and get payed link
orderRouter.post(
  "/:orderId/pay",
  asyncWrapper(orderController.initiatePayment.bind(orderController))
);

export default orderRouter;
