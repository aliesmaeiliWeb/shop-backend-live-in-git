import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http";
import { MulterError } from "multer";

//! ابسترک یعنی این کلاس یه کلاس ناقس هست و خودش به تنهایی نمیتونه کلاس بسازه و فقط بیس و پایه برای بقیه هست

export interface IError {
  status: string,
  statusCode: number;
  message: string
};

export abstract class CustomError extends Error {
  abstract status: string;
  abstract statusCode: number;

  constructor(message: string) {
    super(message);
  }

  public getErrorResponse() {
    return {
      status: this.status,
      statusCode: this.statusCode,
      message: this.message,
    };
  }
}

export class BadRequestException extends CustomError {
  status: string = "error";
  statusCode: number = HTTP_STATUS.bad_erquest;

  constructor(message: string) {
    super(message);
  }
}

export class unauthorizedExeption extends CustomError {
  status: string = "error";
  statusCode: number = HTTP_STATUS.unauthorized;

  constructor(message: string) {
    super(message);
  }
}

export class forbiddenExeption extends CustomError {
  status: string = "error";
  statusCode: number = HTTP_STATUS.forbidden;
}

export class notFoundExeption extends CustomError {
  status: string = "error";
  statusCode: number = HTTP_STATUS.not_found;
}

export class internalExeption extends CustomError {
  status: string = "error";
  statusCode: number = HTTP_STATUS.internal_server_error;
}

export function asyncWrapper(calback: any) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await calback(req, res, next);
    } catch (error: any) {
      // next(new internalExeption(error.message));
      next(error)
    }
  };
}

export const globalErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof CustomError) {
    return res.status(HTTP_STATUS.bad_erquest).json({
      status: err.status,
      message: err.message,
    })
  }

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_UNEXPECTED_FILE") {
      return res.status(HTTP_STATUS.bad_erquest).json({
        status: "error",
        message: `فیلد فایل ارسالی اشتباه است یا تعداد فایل‌ها بیش از حد مجاز است. (فیلد: ${err.field})`,
      });
    }

    if (err.code === "LIMIT_FILE_SIZE") {
      return res.status(HTTP_STATUS.bad_erquest).json({
        status: "error",
        message: "حجم فایل ارسالی بیش از حد مجاز است.",
      });
    }

    return res.status(HTTP_STATUS.bad_erquest).json({
      status: "error",
      message: `خطای آپلود فایل: ${err.message}`,
    });
  }

  if (err instanceof SyntaxError && "body" in err) {
    return res.status(HTTP_STATUS.bad_erquest).json({
      status: "error",
      message: "فرمت JSON ارسال شده نامعتبر است.",
    });
  }

  console.error("💥 Server Error:", err);
  return res.status(HTTP_STATUS.internal_server_error).json({
    status: "error",
    message: "خطای داخلی سرور. لطفاً با پشتیبانی تماس بگیرید.",
  });
}


