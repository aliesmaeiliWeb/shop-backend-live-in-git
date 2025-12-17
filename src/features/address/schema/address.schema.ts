import Joi from "joi";

export const addressSchema = Joi.object({
  title: Joi.string().min(2).max(20).optional(),
  province: Joi.string()
    .required()
    .messages({ "any.required": "Province is required" }),
  city: Joi.string()
    .required()
    .messages({ "any.required": "City is required" }),
  street: Joi.string().required(),

  receiverName: Joi.string().required(),
  receiverPhone: Joi.string().required().regex(/^09\d{9}$/),

  postalCode: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required()
    .messages({
      "string.length": "Postal code must be exactly 10 digits",
      "string.pattern.base": "Postal code must contain only numbers",
    }),
});
