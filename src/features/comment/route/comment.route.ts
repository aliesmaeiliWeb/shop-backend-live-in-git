import express from "express";
import { commentController } from "../controller/comment.controller";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { 
    createCommentSchema, 
    updateCommentSchema, 
    adminStatusSchema 
} from "../schema/comment.schema";
import { verifyUser, checkpermission } from "../../../globals/middlewares/auth.middleware";

// exam: /api/v1/products/:productId/comments
const commentRoute = express.Router({ mergeParams: true });

commentRoute.get("/", asyncWrapper(commentController.getForProduct.bind(commentController)));

commentRoute.use(verifyUser);

commentRoute.post(
  "/",
  validateShema(createCommentSchema),
  asyncWrapper(commentController.create.bind(commentController))
);

const singleCommentRoute = express.Router();
singleCommentRoute.use(verifyUser);

singleCommentRoute.put(
    "/:commentId", 
    validateShema(updateCommentSchema),
    asyncWrapper(commentController.update.bind(commentController))
);

singleCommentRoute.delete(
    "/:commentId", 
    asyncWrapper(commentController.delete.bind(commentController))
);

const adminCommentRoute = express.Router();
adminCommentRoute.use(verifyUser);
adminCommentRoute.use(checkpermission("ADMIN"));

adminCommentRoute.get("/", asyncWrapper(commentController.getAllAdmin.bind(commentController)));

adminCommentRoute.patch(
  "/:commentId/status",
  validateShema(adminStatusSchema),
  asyncWrapper(commentController.updateStatus.bind(commentController))
);

export { commentRoute, singleCommentRoute, adminCommentRoute };