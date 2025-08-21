import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { orderController } from "../controller/order.controller";
import { verifyUser } from "../../../globals/middlewares/auth.middleware";

const orderRouter = express.Router();

orderRouter.get(
  "/",
  verifyUser,
  asyncWrapper(orderController.getAll.bind(orderController))
);

orderRouter.patch(
  "/:id/status",
  verifyUser,
  asyncWrapper(orderController.updateStatus.bind(orderController))
);

orderRouter.get(
  "/:id",
  verifyUser,
  asyncWrapper(orderController.getOne.bind(orderController))
);

export default orderRouter;
