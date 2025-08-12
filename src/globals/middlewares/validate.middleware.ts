import { NextFunction, Request, Response } from "express";
import { Schema, ValidationErrorItem } from "joi";
import { CategorySchema } from "../../features/category/schema/category.schema";

const formatJoiMessage = (joiMessage: ValidationErrorItem[]) => {
  return joiMessage.map((msgObject) => msgObject.message.replace(/['"]/g, ""));
};

export const validateShema = (schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    //! for upload images
    if (req.files) {
      if (Array.isArray(req.files)) {
        if (req.files.length > 0) {
          if (schema === CategorySchema) {
            req.body.imageUrl = req.files[0].filename;
          } else {
            req.body.main_Image = req.files.map(
              (file: Express.Multer.File) => file.filename
            );
          }
        }
      } else {
        const mainImages = req.files["main_Image"];
        if (mainImages && mainImages.length > 0) {
          if (schema === CategorySchema) {
            req.body.imageUrl = mainImages[0].filename;
          } else {
            req.body.main_Image = mainImages.map(
              (file: Express.Multer.File) => file.filename
            );
          }
        }
      }
    }

    const { error } = schema.validate(req.body, { abortEarly: false });

    if (error) {
      const message = formatJoiMessage(error.details);
      res.status(400).json(message);
      return;
    }

    next();
  };
};
