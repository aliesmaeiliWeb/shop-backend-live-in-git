import express, { NextFunction, Request, Response } from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import {
  checkpermission,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";
import { upload } from "../../../globals/helpers/multer";
import parseDynamicAttribute from "../../../globals/middlewares/productChange.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { commentController } from "../controller/comment.controller";
import {
  createCommentSchema,
  updateCommentStatusSchema,
} from "../schema/comment.schema";

//! mock
interface FakeUserPayload {
  id: number;
  role: string;
}

const mockUserMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.currentUser = {
    id: 18,
    role: "Admin",
    email: "shop3@gmail.com",
    name: "Test",
    lastName: "User",
    avatar: "alikcatar",
  };
  next();
};

const commentRoute = express.Router({ mergeParams: true });

commentRoute.get(
  '/',
  asyncWrapper(commentController.getForProduct.bind(commentController))
);

commentRoute.post(
  "/",
  // verifyUser,
  mockUserMiddleware,
  validateShema(createCommentSchema),
  asyncWrapper(commentController.create.bind(commentController))
);

const adminCommentRoute = express.Router();
adminCommentRoute.get(
  "/",
  asyncWrapper(commentController.getAll.bind(commentController))
);

adminCommentRoute.patch(
  "/:commentId/status",
  // verifyUser,
  // checkpermission("Shop", "Admin"),
  mockUserMiddleware,
  validateShema(updateCommentStatusSchema),
  asyncWrapper(commentController.updateStatus.bind(commentController))
);

export { commentRoute, adminCommentRoute };

//! verifying checked!
