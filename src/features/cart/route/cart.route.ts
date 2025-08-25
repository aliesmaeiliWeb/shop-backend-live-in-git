import express from "express";
import { cartController } from "../controller/cart.controller";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { verifyUser } from "../../../globals/middlewares/auth.middleware";

const cartRoute = express.Router();
cartRoute.use(verifyUser);

cartRoute.post(
  "/",
  asyncWrapper(cartController.addToCart.bind(cartController))
);
cartRoute.delete(
  "/:id",
  asyncWrapper(cartController.clearCart.bind(cartController))
);
cartRoute.delete(
  "/item/:id",
  asyncWrapper(cartController.removeCartItem.bind(cartController))
);
cartRoute.get(
  "/",
  asyncWrapper(cartController.getMyCart.bind(cartController))
);

export default cartRoute;
