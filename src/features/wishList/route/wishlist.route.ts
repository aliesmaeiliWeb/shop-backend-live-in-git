import express, { NextFunction, Request, Response } from "express";
import { checkpermission, verifyUser } from "../../../globals/middlewares/auth.middleware";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { wishListController } from "../controller/wishlist.controller";

const wishListRouter = express.Router();

wishListRouter.use(verifyUser);

wishListRouter.post(
  "/",
  asyncWrapper(wishListController.addWishlist.bind(wishListController))
);
wishListRouter.delete(
  "/:productId",
  asyncWrapper(wishListController.delete.bind(wishListController))
);
wishListRouter.get(
  "/",
  asyncWrapper(wishListController.read.bind(wishListController))
);

export default wishListRouter;
