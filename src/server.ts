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
