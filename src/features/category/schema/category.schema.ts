import Joi from "joi";

export const CategorySchema = Joi.object({
  name: Joi.string().required(),
  icon: Joi.string().required(),
  attributeIds: Joi.array().items(Joi.number()).optional().default([]),
  imageUrl: Joi.any().optional(),
});
