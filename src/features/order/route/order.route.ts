import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { orderController } from "../controller/order.controller";
import { verifyUser } from "../../../globals/middlewares/auth.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { createOrderSchema } from "../schema/order.schema";

const orderRouter = express.Router();
orderRouter.use(verifyUser);

orderRouter.post(
  "/",
  validateShema(createOrderSchema),
  asyncWrapper(orderController.create.bind(orderController))
);

orderRouter.patch(
  "/:id/cancel",
  asyncWrapper(orderController.cancel.bind(orderController))
)

export default orderRouter;
