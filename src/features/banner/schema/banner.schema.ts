import { BannerPosition } from "@prisma/client";
import Joi from "joi";

const validPositions = Object.values(BannerPosition);

export const createBannerSchema = Joi.object({
  link: Joi.string().allow("").optional(),
  isActive: Joi.boolean().default(true),
  position: Joi.string()
    .valid(...validPositions)
    .required()
    .messages({
      "any.only": "موقعیت بنر نامعتبر است",
      "any.required": "انتخاب موقعیت بنر الزامی است",
    }),
});

export const updateBannerSchema = Joi.object({
  link: Joi.string().allow("").optional(),
  isActive: Joi.boolean().optional(),
  position: Joi.string()
    .valid(...validPositions)
    .optional(),
});
