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


const commentRoute = express.Router({ mergeParams: true });
commentRoute.use(verifyUser);

commentRoute.get(
  '/',
  asyncWrapper(commentController.getForProduct.bind(commentController))
);

commentRoute.post(
  "/",
  validateShema(createCommentSchema),
  asyncWrapper(commentController.create.bind(commentController))
);

commentRoute.patch(
  "/:commentId",
  validateShema(updateCommentStatusSchema),
  asyncWrapper(commentController.update.bind(commentController))
);

commentRoute.delete(
  "/:commentId",
  asyncWrapper(commentController.delete.bind(commentController))
);



//! admin commentRoute

const adminCommentRoute = express.Router();
adminCommentRoute.use(verifyUser); 
adminCommentRoute.get(
  "/",
  asyncWrapper(commentController.getAll.bind(commentController))
);

adminCommentRoute.patch(
  "/:commentId/status",
  checkpermission("Shop","Admin"),
  validateShema(updateCommentStatusSchema),
  asyncWrapper(commentController.updateStatus.bind(commentController))
);

export { commentRoute, adminCommentRoute };
