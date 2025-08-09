import { NextFunction, Request, Response } from "express";
import { authService } from "../../../services/db/auth.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import {
  BadRequestException,
  unauthorizedExeption,
} from "../../../globals/middlewares/error.middleware";

class AuthController {
  private setTokenAndRespond(
    res: Response,
    accessToken: string,
    refreshToken: string,
    message: string,
    status: number
  ) {
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true, // access only server
      secure: process.env.NODE_ENV === "production", // https send
      maxAge: 7 * 24 * 60 * 1000, // expired cookie in 7 days
    });
    // console.log('✅ Token Sent to Client:', accessToken);

    res.status(status).json({
      message,
      accessToken,
    });
  }

  public async registerUser(req: Request, res: Response, next: NextFunction) {
    if (await authService.isEmailAlreadyExist(req.body.email)) {
      next(new BadRequestException("email must be unique"));
      return;
    }

    const { accessToken, refreshToken } = await authService.addUser(req.body);

    this.setTokenAndRespond(
      res,
      accessToken,
      refreshToken,
      "User registred and logged in successfully!",
      HTTP_STATUS.create
    );
  }

  public async loginUser(req: Request, res: Response, next: NextFunction) {
    const { accessToken, refreshToken } = await authService.login(req.body);

    this.setTokenAndRespond(
      res,
      accessToken,
      refreshToken,
      "User logged in successfully!",
      HTTP_STATUS.ok
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
  }
}

export const authController: AuthController = new AuthController();
