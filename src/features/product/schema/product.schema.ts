import Joi from "joi";

export const productSchema = Joi.object({
  name: Joi.string().required(),
  longDescription: Joi.string().required(),
  shortDescription: Joi.string().required(),
  main_Image: Joi.any(),
  categoryId: Joi.number().integer().required(),
  price: Joi.number().required(),
  dynamicAttributes: Joi.object(),
  discountPercentage: Joi.number().integer().optional() 
});

export const updateProductSchema = Joi.object({
   name: Joi.string().optional(),
  longDescription: Joi.string().optional(),
  shortDescription: Joi.string().optional(),
  main_Image: Joi.any(),
  categoryId: Joi.number().integer().optional(),
  price: Joi.number().optional(),
  dynamicAttributes: Joi.object(),
  discountPercentage: Joi.number().integer().optional() 
})
