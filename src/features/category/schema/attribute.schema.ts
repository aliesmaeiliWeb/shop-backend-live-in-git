import Joi from "joi";

export const AttributeCreateSchema = Joi.object({
  name: Joi.string().required().min(2), 
});

export const AttributeValueSchema = Joi.object({
  value: Joi.string().required(), 
  colorCode: Joi.string().pattern(/^#([0-9A-F]{3}){1,2}$/i).optional(),
});