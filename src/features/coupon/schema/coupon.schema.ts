import Joi from "joi";

export const createCouponSchema = Joi.object({
  code: Joi.string().min(3).max(20).uppercase().required(),
  percent: Joi.number().integer().min(1).max(100).required(),
  maxDiscount: Joi.number().min(0).optional(),
  usageLimit: Joi.number().integer().min(1).default(100),
  expiresAt: Joi.date().greater("now").required().messages({
    "date.greater": "Expiration date must be in the future"
  }),
});

export const updateCouponSchema = Joi.object({
  code: Joi.string().min(3).max(20).uppercase().optional(),
  percent: Joi.number().integer().min(1).max(100).optional(),
  maxDiscount: Joi.number().min(0).optional(),
  usageLimit: Joi.number().integer().min(1).optional(),
  expiresAt: Joi.date().greater("now").optional(),
  isActive: Joi.boolean().optional(),
});