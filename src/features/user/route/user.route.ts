import express from "express";
import { userController } from "../controller/user.controller";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { userSchemaCreate, userSchemaUpdate } from "../schema/user.schema";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import {
  checkpermission,
  preventInActiveUser,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";
import { uploadAvatar } from "../../../globals/helpers/multer";

const userRoute = express.Router();

//+ global middleware ===> it affects all routes
userRoute.use(verifyUser);
userRoute.use(preventInActiveUser);

userRoute.post("/change-password", userController.changePassword);
userRoute.post(
  "/change-avatar",
  uploadAvatar.single("avatar"),
  userController.uploadAvatar
);
userRoute.post(
  "/",
  // verifyUser,
  checkpermission("Admin"),
  validateShema(userSchemaCreate),
  asyncWrapper(userController.createUser.bind(userController))
);
userRoute.put(
  "/:id",
  // verifyUser,
  validateShema(userSchemaUpdate),
  asyncWrapper(userController.update.bind(userController))
);
userRoute.get(
  "/me",
  // verifyUser,
  asyncWrapper(userController.getMe.bind(userController))
);
userRoute.delete(
  "/:id",
  // verifyUser,
  // preventInActiveUser, // check banned user
  asyncWrapper(userController.delete.bind(userController))
);

export default userRoute;
