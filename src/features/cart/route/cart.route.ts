import express from "express";
import { cartController } from "../controller/cart.controller";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { 
  cartAddSchema, 
  cartUpdateQtySchema, 
  cartSyncSchema 
} from "../schema/cart.schema";
import { verifyUser } from "../../../globals/middlewares/auth.middleware";

const cartRouter = express.Router();

cartRouter.use(verifyUser);

cartRouter.get("/", asyncWrapper(cartController.getMyCart.bind(cartController)));

cartRouter.post(
  "/",
  validateShema(cartAddSchema),
  asyncWrapper(cartController.addToCart.bind(cartController))
);

cartRouter.post(
  "/sync",
  validateShema(cartSyncSchema),
  asyncWrapper(cartController.syncCart.bind(cartController))
);

cartRouter.put(
  "/items/:itemId",
  validateShema(cartUpdateQtySchema),
  asyncWrapper(cartController.updateItemQuantity.bind(cartController))
);

cartRouter.delete(
  "/items/:itemId",
  asyncWrapper(cartController.removeItem.bind(cartController))
);

export default cartRouter;