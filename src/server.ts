import express, { Application, NextFunction, Request, Response } from "express";
import cors from "cors";

//? for read data in .env 👇
import "dotenv/config";
import appRoutes from "./globals/routes/appRoutes";
import {
  CustomError,
  IError,
  notFoundExeption,
} from "./globals/middlewares/error.middleware";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import hpp from "hpp";
import path from "path";
import { HTTP_STATUS } from "./globals/constants/http";

class server {
  private app: Application;

  constructor(app: Application) {
    this.app = app;
  }

  public start(): void {
    this.setupMiddleware();
    this.setupRoutes();
    this.setupGlobalError();
    this.startServer();
  }

  private setupMiddleware(): void {
    this.app.use(helmet());
    this.app.use(express.json());
    // this.app.use('/',express.static('image')); //+ for images
    this.app.use(cookieParser()); //? محل اضافه شدن میدلور کوکی پارسر برای رفرش توکن

    const allowedOrigins = ["http://localhost:5173", "http://localhost:5000"];
    this.app.use(
      cors({
        origin: (origin, callback) => {
          if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
          } else {
            callback(new Error("Not allowed by CORS"));
          }
        },
        credentials: true,
      })
    );

    //? clean middleware
    this.app.use(mongoSanitize());
    this.app.use(xss());
    this.app.use(hpp());

    this.app.use(
      "/image/products",
      express.static(path.join(process.cwd(), "uploads", "products"))
    );

    this.app.use(
      "/image/banners",
      express.static(path.join(process.cwd(), "uploads", "banners"))
    );

    this.app.use(
      "/image/category",
      express.static(path.join(process.cwd(), "uploads", "category"))
    );

    this.app.use(
      "/image",
      (req, res, next) => {
        res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
        next();
      },
      express.static(path.resolve(process.cwd(), "image"))
    );
  }
  private setupRoutes(): void {
    appRoutes(this.app);
  }
  private setupGlobalError(): void {
    //? not found
    this.app.all("*", (req, res, next) => {
      return next(new notFoundExeption(`the url ${req.originalUrl} not found`));
      //! بعد از ارور هندلر در میدل ور دیگر نیازی به این زیری نداریم برای بهتر شدن کد
    });

    //? global
    this.app.use(
      (err: IError, req: Request, res: Response, next: NextFunction) => {
        console.log(err);
        if (err instanceof CustomError) {
          return res.status(err.statusCode).json(err.getErrorResponse());
        }
        next();

        return res.status(HTTP_STATUS.internal_server_error).json({
          message: "internall Error",
          data: { err },
        });
      }
    );
  }

  private startServer() {
    const port = parseInt(process.env.PORT!) || 5050;

    this.app.listen(port, () => {
      console.log(`server is runint port : ${port}`);
    });
  }
}

export default server;
