import Joi from "joi";

export const AttributeSchema = Joi.object({
  name: Joi.string().required(),
  label: Joi.string().required(),
  type: Joi.string().valid("text", "number", "select", "color").required(),
  options: Joi.array().items(Joi.string()).optional().default([]),
});
