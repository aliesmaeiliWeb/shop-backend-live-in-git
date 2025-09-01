import Joi, { valid } from "joi";

export const userSchemaCreate = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required().min(6).max(20),
  name: Joi.string().required().min(2).max(50),
  lastName: Joi.string().required().min(2).max(50),
  avatar: Joi.string(),
  role: Joi.string().valid("Admin", "User").required(),
  phoneNumber: Joi.string().min(11).max(11).optional(),
  isActive: Joi.boolean().optional(),
});

export const userSchemaUpdate = Joi.object({
  email: Joi.string().email().optional(),
  password: Joi.string().optional().min(6).max(20),
  name: Joi.string().optional().min(2).max(50),
  lastName: Joi.string().optional().min(2).max(50),
  avatar: Joi.string(),
  role: Joi.string().valid("Admin", "User").optional(),
  phoneNumber: Joi.string().min(11).max(11).optional(),
  isActive: Joi.boolean().optional(),
});
