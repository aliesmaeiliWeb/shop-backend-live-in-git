import { NextFunction, Request, Response } from "express";
import {
  forbiddenExeption,
  notFoundExeption,
  unauthorizedExeption,
} from "./error.middleware";
import jwt from "jsonwebtoken";
import { userService } from "../../services/db/user.service";

export function verifyUser(req: Request, res: Response, next: NextFunction) {
  if (
    //+ check headers
    !req.headers["authorization"] ||
    !req.headers["authorization"].startsWith("Bearer")
  ) {
    throw new unauthorizedExeption("Token is invalid , please login again");
  }

  //+ get token and remove bearer
  const token = req.headers["authorization"].split(" ")[1];

  try {
    //+ decode jwt token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload; //! این چطور اومد تحقیق بشه
    //+ data information send req.query for read system
    req.currentUser = decoded;

    next();
  } catch (error) {
    throw new unauthorizedExeption("Token is invalid , please login again");
  }
}

export function checkUserAthunticated(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.currentUser) {
    throw new forbiddenExeption("you are not logged");
  }
  next();
}

export function checkpermission(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    //+ check role user in to the req.currentUser
    if (!roles.includes(req.currentUser.role)) {
      throw new forbiddenExeption("you can not perform this action");
    }

    next();
  };
}

export async function preventInActiveUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = await userService.getOne(req.currentUser.id.toString());

  if (!user) {
    throw new notFoundExeption(
      `user doesnot exist widht id: ${req.currentUser.id}`
    );
  }

  if (!user.isActive) {
    throw new forbiddenExeption(`you was banned`);
  }

  next();
}
