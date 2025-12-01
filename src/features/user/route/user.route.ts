import express from "express";
import {
  checkpermission,
  preventInActiveUser,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { userController } from "../controller/user.controller";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { userCreateSchema, userUpdateSchema } from "../schema/user.schema";
import { uploadAvatar } from "../../../globals/helpers/multer";

const userRoute = express.Router();

userRoute.use(verifyUser);
userRoute.use(preventInActiveUser);

//? get my own profile
userRoute.get("/me", asyncWrapper(userController.getMe.bind(userController)));

//? update my own profile
userRoute.put(
  "/me",
  uploadAvatar.single("avatar"),
  validateShema(userUpdateSchema),
  asyncWrapper(userController.updateMe.bind(userController))
);

//! admin routes (only admin)
userRoute.use(checkpermission("ADMIN"));

userRoute.post(
  "/",
  validateShema(userCreateSchema),
  asyncWrapper(userController.create.bind(userController))
);

userRoute.get("/", asyncWrapper(userController.getAll.bind(userController)));

userRoute.get("/:id", asyncWrapper(userController.getOne.bind(userController)));

userRoute.put(
  "/:id",
  uploadAvatar.single("avatar"),
  validateShema(userUpdateSchema),
  asyncWrapper(userController.update.bind(userController))
);

userRoute.delete(
  "/:id",
  asyncWrapper(userController.delete.bind(userController))
);

export default userRoute;
