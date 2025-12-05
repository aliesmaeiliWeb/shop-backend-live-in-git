import express from "express";
import { authLimiter } from "../../../globals/middlewares/rateLimit.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { authController } from "../controller/auth.controller";
import {
  adminCreateSchema,
  adminLoginSchema,
  authRequestOTPSchema,
  authVerifyOTPSchema,
  changePasswordSchema,
} from "../schema/user.schema";
import { userController } from "../controller/user.controller";
import { verifyUser } from "../../../globals/middlewares/auth.middleware";

const authRoute = express.Router();

authRoute.post(
  "/send-otp",
  authLimiter,
  validateShema(authRequestOTPSchema),
  asyncWrapper(authController.sendOtp.bind(authController))
);

authRoute.post(
  "/verify-otp",
  authLimiter,
  validateShema(authVerifyOTPSchema),
  asyncWrapper(authController.verifyOtp.bind(authController))
);

authRoute.post(
  "/admin/login",
  authLimiter,
  validateShema(adminLoginSchema),
  asyncWrapper(authController.loginAdmin.bind(authController))
);

authRoute.patch(
  "/change-password",
  verifyUser,
  validateShema(changePasswordSchema),
  asyncWrapper(authController.changePassword.bind(userController))
);

authRoute.post(
  "/admin/create",
  validateShema(adminCreateSchema),
  asyncWrapper(authController.createAdmin.bind(authController))
);

authRoute.post(
  "/refresh-token",
  asyncWrapper(authController.refreshToken.bind(authController))
);

authRoute.post(
  "/logout",
  asyncWrapper(authController.logOut.bind(authController))
);

export default authRoute;
