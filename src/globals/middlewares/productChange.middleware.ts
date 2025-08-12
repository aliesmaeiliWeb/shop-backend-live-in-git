import { NextFunction, Request, Response } from "express";
import { HTTP_STATUS } from "../constants/http";

function parseDynamicAttribute(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    if (typeof req.body.dynamicAttributes === "string") {
      req.body.dynamicAttributes = JSON.parse(req.body.dynamicAttributes);
    }
    next();
  } catch (error) {
    return res.status(HTTP_STATUS.bad_erquest).json({
      message: "invalid json in dynamicAttribute",
    });
  }
}

export default parseDynamicAttribute;
