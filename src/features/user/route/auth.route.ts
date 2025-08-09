import express from "express";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { userSchemaCreate } from "../schema/user.schema";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { authController } from "../controller/auth.controller";
import { authLimiter } from "../../../globals/middlewares/rateLimit.middleware";

const authRoute = express.Router();
//! register
authRoute.post(
  "/register",
  authLimiter,
  validateShema(userSchemaCreate),
  asyncWrapper(authController.registerUser.bind(authController))
);
//! login
authRoute.post(
  "/login",
  authLimiter,
  //!  خب اینجا با اد کردن کتابخونه اکسپرس ایسینک ارور دیگر نیازی به بخش ایسینک ورپر نخواهیم داشت
  asyncWrapper(authController.loginUser.bind(authController))
);

//! refresh-token
authRoute.post(
  "/refresh-token",
  authLimiter,
  asyncWrapper(authController.refreshToken.bind(authController))
)

export default authRoute;

//! bind => برای بخش اپورایزیشن و رفرش توکن هست که میگه دیسی که استفاده شده باید بایند بشه یعنی به نوعی وقتی که ما مقدار لاگین یوزر رو میفرستم به داخل ایسینگ ورپر اونجا نمیتونه و تنها میمونه و نمیتونه از ست توکن اند رسپانس استفاده بکنه برای همین بایند میکنیم و دفتر کار با همه همکاراشو بهش میچسبانیم
