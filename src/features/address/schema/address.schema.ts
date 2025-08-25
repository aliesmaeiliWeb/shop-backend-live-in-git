import Joi from "joi";

export const addressSchema = Joi.object({
  street: Joi.string().required(),
  province: Joi.string().required(),
  country: Joi.string().required(),
  postalCode: Joi.number().integer().required(),
});
