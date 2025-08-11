import {
  IAuthLogin,
  IAuthRegister,
} from "../../features/user/interface/auth.interface";
import { User } from "../../generated/prisma";
import { prisma } from "../../prisma";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import {
  BadRequestException,
  unauthorizedExeption,
} from "../../globals/middlewares/error.middleware";

class AuthService {
  //! generateToken for no repead
  private generateToken(payload: UserPayload) {
    // ۱. خواندن متغیرهای محیطی و بررسی وجود آن‌ها
    const accessTokenSecret = process.env.JWT_SECRET;
    const refreshTokenSecret = process.env.JWT_REFRESH_TOKEN_SECRET;
    //! چون بخش اکسپایرس این به نوعی که وارد میشه خیلی حساسه برا همین باید صراحتا مقادریر دات انو رو به عدد تبدیل بکنیم تا اساین ارور نده
    const accessTokenExpiresIn = parseInt(
      process.env.JWT_ACCESS_TOKEN_EXPIRES_IN!,
      10
    );
    const refreshTokenExpiresIn = parseInt(
      process.env.JWT_REFRESH_TOKEN_EXPIRES_IN!,
      10
    );

    // ۲. پرتاب خطا در صورت تعریف نشدن هر کدام
    if (
      !accessTokenSecret ||
      !accessTokenExpiresIn ||
      !refreshTokenSecret ||
      !refreshTokenExpiresIn
    ) {
      // این یک خطای داخلی سرور است چون تنظیمات به درستی انجام نشده
      throw new Error(
        "JWT secrets or expiration times are not defined in .env file!"
      );
    }

    // console.log("SECRET KEY USED FOR SIGNING:", process.env.JWT_SECRET);

    // ۳. استفاده از متغیرهای تایید شده (حالا تایپ‌اسکریپت هیچ خطایی نمی‌گیرد)
    const accessToken = jwt.sign(payload, accessTokenSecret!, {
      expiresIn: accessTokenExpiresIn,
    });

    const refreshToken = jwt.sign(payload, refreshTokenSecret!, {
      expiresIn: refreshTokenExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  //! register
  public async addUser(requestBody: IAuthRegister) {
    const { email, name, lastName, password, avatar } = requestBody;

    const hashedPass = await bcrypt.hash(password, 10);

    const lowercasedEmail = email.toLowerCase();

    const newUser: User = await prisma.user.create({
      data: {
        email: lowercasedEmail,
        password: hashedPass,
        name,
        lastName,
        avatar,
      },
    });

    //? create jwt
    const payload: UserPayload = {
      id: newUser.id,
      email,
      name,
      lastName,
      avatar,
      role: newUser.role,
    };

    // const accessToken: string = jwt.sign(payload, process.env.JWT_SECRET!);

    //? خب ما اینجا فقط به اکسس توکن نیاز داریم نه دیتا البته میشه دیتا رو هم ارسال کرد
    return this.generateToken(payload);
  }

  //! login
  public async login(requestBody: IAuthLogin) {
    //? Get user by email
    const user: User | null = await this.getUserByEmail(requestBody.email);
    //? check email exist
    if (!user) {
      throw new BadRequestException("invalid credentials");
    }
    //? check password
    const isMatchPassword: boolean = await bcrypt.compare(
      requestBody.password,
      user.password!
    );
    if (!isMatchPassword) {
      throw new BadRequestException("invalid credentials");
    }
    //? generate JWT -> access token
    const payload: UserPayload = {
      id: user.id,
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role,
    };
    // const accessToken: string = await this.gnerateJWT(payload);

    return this.generateToken(payload);
  }

  public async getUserByEmail(email: string) {
    const lowerCasedEmail = email.toLocaleLowerCase();
    return await prisma.user.findFirst({
      where: {
        email: {
          equals: lowerCasedEmail,
        },
      },
    });
  }

  private gnerateJWT(payload: any) {
    return jwt.sign(payload, process.env.JWT_SECRET!);
  }

  //! check exist email
  public async isEmailAlreadyExist(email: string): Promise<boolean> {
    const userByEmail = await this.getUserByEmail(email);

    return userByEmail != null; //! اگر مقداری بود ترو بر میگردونه و اگر مقداری نبود فالس برگردونده میشه
  }

  //! refresh token logic
  public async refreshAccessToken(token: string) {

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_REFRESH_TOKEN_SECRET!
      ) as UserPayload;

      const user = await prisma.user.findUnique({
        where: {
          email: decoded.email,
        },
      });
      if (!user) {
        throw new unauthorizedExeption(
          "User belonging to this token no longer exists"
        );
      }

      const newPayload: UserPayload = {
        id: user.id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        avatar: user.avatar,
        role: user.role,
      };

      const accessToken = jwt.sign(newPayload, process.env.JWT_SECRET!, {
        expiresIn: parseInt(process.env.JWT_ACCESS_TOKEN_EXPIRES_IN!, 10),
      });

      return { accessToken };
    } catch (error) {
      console.error("🔥🔥🔥 REFRESH TOKEN VERIFICATION FAILED! 🔥🔥🔥");
      console.error("The actual error object is:", error);
      throw new unauthorizedExeption(
        "Invalid or expired refresh token. Please login again."
      );
    }
  }
}

export const authService: AuthService = new AuthService();
