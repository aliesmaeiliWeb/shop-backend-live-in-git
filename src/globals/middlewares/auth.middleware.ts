import { NextFunction, Request, Response } from "express";
import { forbiddenExeption, unauthorizedExeption } from "./error.middleware";
import jwt from "jsonwebtoken";

export function verifyUser(req: Request, res: Response, next: NextFunction) {
  // console.log("--- Verifying Request ---");
  // console.log("Raw Authorization Header:", req.headers["authorization"]);
  if (
    !req.headers["authorization"] ||
    !req.headers["authorization"].startsWith("Bearer")
  ) {
    throw new unauthorizedExeption("Token is invalid , please login again");
  }

  const token = req.headers["authorization"].split(" ")[1];

  // console.log("🔑 Token Extracted for Verification:", token);
  // console.log("--------------------------");

  try {
    console.log("SECRET KEY USED FOR VERIFICATION:", process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as UserPayload; //! این چطور اومد تحقیق بشه
    req.currentUser = decoded;

    next();
  } catch (error) {
    // console.log("🔥🔥🔥 JWT VERIFICATION FAILED 🔥🔥🔥");
    // console.log("The actual error object is:", error);

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
