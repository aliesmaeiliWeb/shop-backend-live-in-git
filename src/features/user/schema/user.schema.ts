import Joi, { valid } from "joi";

export const userSchemaCreate = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(20),
  name: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  avatar: Joi.string(),
  role: Joi.string().valid("Admin", "User").required()
});

export const userSchemaUpdate = Joi.object({
  name: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  avatar: Joi.string(),
});
