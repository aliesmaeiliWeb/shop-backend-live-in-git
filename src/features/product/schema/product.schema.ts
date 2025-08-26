import Joi from "joi";

export const productSchema = Joi.object({
  name: Joi.string().required(),
  longDescription: Joi.string().required(),
  shortDescription: Joi.string().required(),
  main_Image: Joi.any(),
  categoryId: Joi.number().integer().required(),
  price: Joi.number().required(),
  dynamicAttributes: Joi.object()
});
