import { NextFunction, Request, Response } from "express";
import { authService } from "../../../services/db/auth.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import {
  unauthorizedExeption,
} from "../../../globals/middlewares/error.middleware";

class AuthController {
  private setTokenAndRespond(
    res: Response,
    accessToken: string,
    refreshToken: string,
    message: string,
    status: number,
    user?: any,
  ) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // access only server
      secure: process.env.NODE_ENV === "production", // https send
      maxAge: 7 * 24 * 60 * 1000, // expired cookie in 7 days
    });

    res.status(status).json({
      message,
      accessToken,
    });
  };

  public async sendOtp (req:Request, res:Response) {
    const otp = await authService.requesOtp(req.body);

    res.status(HTTP_STATUS.ok).json({
      message: "Otp code send successfully",
      data: otp
    });
  };

  public async verifyOtp(req:Request, res:Response) {
    const {accessToken, refreshToken, user} = await authService.verifyOTP(req.body);

    this.setTokenAndRespond(
      res,
      accessToken,
      refreshToken,
      "User logged in successfully",
      HTTP_STATUS.ok,
      user
    );
  }

  public async refreshToken(req: Request, res: Response, next: NextFunction) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new unauthorizedExeption(
        "refresh token not found , please login again"
      );
    }

    const { accessToken } = await authService.refreshAccessToken(refreshToken);

    res.status(HTTP_STATUS.ok).json({
      message: "Token refreshed successfully!",
      accessToken,
    });
  };

  public async logOut (req: Request, res:Response) {
    res.clearCookie("refreshToken");
    res.status(HTTP_STATUS.ok).json({message: "logged out successfully"});
  }
}

export const authController: AuthController = new AuthController();
