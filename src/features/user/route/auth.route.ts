import express from "express";
import { authLimiter } from "../../../globals/middlewares/rateLimit.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { authController } from "../controller/auth.controller";
import {
  authRequestOTPSchema,
  authVerifyOTPSchema,
} from "../schema/user.schema";

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
  "/refresh-token",
  asyncWrapper(authController.refreshToken.bind(authController))
);

authRoute.post(
  "/logout",
  asyncWrapper(authController.logOut.bind(authController))
);

export default authRoute;
