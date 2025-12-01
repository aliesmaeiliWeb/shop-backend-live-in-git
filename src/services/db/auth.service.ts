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
import {
  IAdminCreate,
  IAdminLogin,
} from "../../features/user/interface/user.interface";

class AuthService {
  //! login Admin whth phone and password
  public async loginAdmin(data: IAdminLogin) {
    const { phoneNumber, password } = data;

    //? find admin
    const user = await prisma.user.findUnique({ where: { phoneNumber } });
    if (!user) {
      throw new unauthorizedExeption("دسترسی غیر مجاز");
    }

    //? check role
    if (user.role !== "ADMIN") {
      throw new unauthorizedExeption(
        "برای دسترسی به این بخش باید ادمین وبسایت باشید"
      );
    }

    //? check password
    const isMatch = await bcrypt.compare(password, user.password || "");
    if (!isMatch) {
      throw new unauthorizedExeption("دسترسی غیر مجاز");
    }

    // 4. Generate Tokens
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

  //!  change password
  public async changepassword(userId: string, data: any) {
    const { oldPassword, newPassword } = data;

    //? find user
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("کاربری با این مشخصات پیدا نشد");
    }

    if (!user.password) {
      throw new BadRequestException("کاربر مورد نظر رمز عبور ندارد");
    }

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      throw new BadRequestException("رمز عبور فعلی اشتباه است");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { message: "password changed successfully" };
  }

  // //! create first admin
  public async CreateInitialAdmin(data: IAdminCreate) {
    const { phoneNumber, password } = data;
    const existing = await prisma.user.findUnique({ where: { phoneNumber } });
    if (existing) throw new BadRequestException("کاربر موجود است");

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.user.create({
      data: {
        phoneNumber: data.phoneNumber,
        password: hashedPassword,
        name: data.name,
        role: "ADMIN",
        isActive: true,
      },
    });

    return admin;
  }

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
    }

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
