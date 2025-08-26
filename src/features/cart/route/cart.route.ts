import express from "express";
import { cartController } from "../controller/cart.controller";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { verifyUser } from "../../../globals/middlewares/auth.middleware";

const cartRoute = express.Router();
cartRoute.use(verifyUser);

//+ add product to cart
cartRoute.post(
  "/",
  asyncWrapper(cartController.addToCart.bind(cartController))
);
//+ clear all productitem in cart
cartRoute.delete(
  "/:id",
  asyncWrapper(cartController.clearCart.bind(cartController))
);
//+ remove one item in cart
cartRoute.delete(
  "/item/:id",
  asyncWrapper(cartController.removeCartItem.bind(cartController))
);
//+ get all data cart user
cartRoute.get("/", asyncWrapper(cartController.getMyCart.bind(cartController)));
//+ update
cartRoute.patch(
  "/item/:id",
  asyncWrapper(cartController.updateCartItem.bind(cartController))
);

export default cartRoute;
