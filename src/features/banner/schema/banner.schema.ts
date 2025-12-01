import Joi from "joi";

export const createBannerSchema = Joi.object({
  link: Joi.string().allow("").optional(),
  isActive: Joi.boolean().default(true),
});

export const updateBannerSchema = Joi.object({
  link: Joi.string().allow("").optional(),
  isActive: Joi.boolean().optional(),
});