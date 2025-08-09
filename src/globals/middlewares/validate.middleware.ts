import { NextFunction, Request, Response } from "express";
import { Schema, ValidationErrorItem } from "joi";

const formatJoiMessage = (joiMessage: ValidationErrorItem[]) => {
  return joiMessage.map((msgObject) => msgObject.message.replace(/['"]/g, ''));
};

export const validateShema = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const message = formatJoiMessage(error.details);
      res.status(400).json(message);
      return;
    }

    next(); 
  };
};
