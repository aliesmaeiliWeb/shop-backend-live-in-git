import Joi from "joi";

export const CategoryCreateSchema = Joi.object({
  name: Joi.string().required().min(2).max(50),
  parentId: Joi.string().optional().allow(null), // Can be null for Root categories
  // Icon is handled via Multer usually, but if sent as string:
  icon: Joi.string().optional().allow(""), 
});

export const CategoryUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  parentId: Joi.string().optional().allow(null),
  isActive: Joi.boolean().optional(),
  icon: Joi.string().optional().allow(""),
});

