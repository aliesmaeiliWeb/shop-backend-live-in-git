import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { orderController } from "../controller/order.controller";
import { checkpermission, verifyUser } from "../../../globals/middlewares/auth.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { createOrderSchema, updateOrderStatusSchema } from "../schema/order.schema";

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

//+ using middleware fo admin access
orderRouter.use(checkpermission("Admin", "Shop"));

//+ get history orders user
orderRouter.get(
  '/my-orders',
  asyncWrapper(orderController.getMyOrder.bind(orderController))
);

//+ get all order
orderRouter.get(
  '/all',
  asyncWrapper(orderController.getAll.bind(orderController))
);

//+ get order by id
orderRouter.get(
  '/:id',
  asyncWrapper(orderController.getOne.bind(orderController))
);

//+ get all order for user
orderRouter.get(
  '/user/:userId',
  asyncWrapper(orderController.getForUser.bind(orderController))
);

//+ change status order by admin
orderRouter.patch(
  '/:id/status',
  validateShema(updateOrderStatusSchema),
  asyncWrapper(orderController.updateStatus.bind(orderController))
);

//+ cancel order by admin
orderRouter.patch(
  '/:id/cancel-admin',
  asyncWrapper(orderController.cancelByAdmin.bind(orderController))
)

export default orderRouter;
