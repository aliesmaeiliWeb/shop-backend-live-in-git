import bcrypt from "bcrypt";
import { prisma } from "../../prisma";
import {
  BadRequestException,
  unauthorizedExeption,
} from "../../globals/middlewares/error.middleware";
import {
  IAuthRequestOtp,
  IAuthVerifyOtp,
} from "../../features/user/interface/auth.interface";
import { tokenHelper } from "../../globals/helpers/tokenHelper";
import { smsHelper } from "../../globals/helpers/sms.helper";

class AuthService {
  //! get phone number
  public async requesOtp(data: IAuthRequestOtp) {
    const { phoneNumber } = data;

    //? create randome code
    const otpCode = Math.floor(10000 + Math.random() * 9000).toString();

    //? set time => 2 min later
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000);

    //? hash code
    const hashedOtp = await bcrypt.hash(otpCode, 10);

    await prisma.user.upsert({
      where: { phoneNumber },
      update: {
        otpCode: hashedOtp,
        otpExpiresAt: expiresAt,
      },
      create: {
        phoneNumber,
        otpCode: hashedOtp,
        otpExpiresAt: expiresAt,
        role: "USER",
        name: "",
        lastName: "",
        email: null,
        avatar: "",
      },
    });

    if (process.env.NODE_ENV === "development") {
      console.log(`DEV MODE SMS: ${otpCode}`);
    };

    // send otp
    await smsHelper.sendOTP(phoneNumber, otpCode);

    return { message: "otp sent successfully", otpCode };
  }

  //! verify code
  public async verifyOTP(data: IAuthVerifyOtp) {
    const { phoneNumber, otpCode } = data;

    //? find user
    const user = await prisma.user.findUnique({ where: { phoneNumber } });

    if (!user) {
      throw new BadRequestException("کاربری با این شماره همراه پیدا نشد");
    }

    //? check expire time
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      throw new BadRequestException(
        "زمان کد ارسالی پایان یافته دوباره تلاش بکنید"
      );
    }

    //? check code
    const isMatch = await bcrypt.compare(otpCode, user.otpCode || "");
    if (!isMatch) {
      throw new BadRequestException("کد نامعتبر است");
    }

    //? delete used code
    await prisma.user.update({
      where: { id: user.id },
      data: { otpCode: null, otpExpiresAt: null },
    });

    //? build token
    const accessToken = tokenHelper.generateAccessToken({
      id: user.id,
      role: user.role,
    });

    const refreshToken = tokenHelper.generateRefreshToken({
      id: user.id,
      role: user.role,
    });

    return { accessToken, refreshToken, user };
  }

  //! refresh token logic
  public async refreshAccessToken(token: string) {
    const decode: any = tokenHelper.verifyToken(token);

    if (!decode || !decode.id) {
      throw new unauthorizedExeption("رفرش توکن نامعتبر است");
    }

    //? check user
    const user = await prisma.user.findUnique({
      where: { id: decode.id },
    });

    if (!user) {
      throw new unauthorizedExeption("کاربر وجود ندارد");
    }

    const accessToken = tokenHelper.generateAccessToken({
      id: user.id,
      role: user.role,
    });

    return { accessToken };
  }
}

export const authService: AuthService = new AuthService();
