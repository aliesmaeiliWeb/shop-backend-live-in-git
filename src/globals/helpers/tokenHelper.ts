import jwt from "jsonwebtoken";

class TokenHelper {
  public generateAccessToken(payload: { id: string; role: string }): string {
    return jwt.sign(payload, process.env.JWT_SECRET || "secret_key_dev", {
      expiresIn: "15d", // عمر کوتاه برای امنیت
    });
  }

  public generateRefreshToken(payload: { id: string; role: string }): string {
    return jwt.sign(payload, process.env.JWT_SECRET || "secret_key_dev", {
      expiresIn: "30d", // عمر طولانی برای راحتی کاربر
    });
  }

  public verifyToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET || "secret_key_dev");
    } catch (error) {
      return null;
    }
  }
}

export const tokenHelper: TokenHelper = new TokenHelper();