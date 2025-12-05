import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { verifyUser } from "../../../globals/middlewares/auth.middleware";
import { wishListController } from "../controller/wishlist.controller";

const wishListRouter = express.Router();

wishListRouter.use(verifyUser);

wishListRouter.get(
  "/",
  asyncWrapper(wishListController.getMyWishlist.bind(wishListController))
);

wishListRouter.post(
  "/:productId",
  asyncWrapper(wishListController.toggle.bind(wishListController))
);

wishListRouter.get(
  "/:productId/check",
  asyncWrapper(wishListController.checkStatus.bind(wishListController))
);

export default wishListRouter;
