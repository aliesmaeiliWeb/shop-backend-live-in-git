import Joi from "joi";

export const createCommentSchema = Joi.object({
  text: Joi.string().min(3).max(1000).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
});

export const updateCommentSchema = Joi.object({
  text: Joi.string().min(3).max(1000).required(),
  rating: Joi.number().integer().min(1).max(5).required(),
});

//? validation for admin => for accept comment
export const adminStatusSchema = Joi.object({
  isApproved: Joi.boolean().required(),
});