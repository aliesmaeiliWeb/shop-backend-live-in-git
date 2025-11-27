import Joi from "joi";

export const authRequestOTPSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^09[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base":
        "Phone number must be a valid Iranian number (e.g., 09123456789)",
    }),
});

export const authVerifyOTPSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^09[0-9]{9}$/)
    .required(),
  otpCode: Joi.string().length(5).required(),
});

export const userCreateSchema = Joi.object({
  phoneNumber: Joi.string()
    .pattern(/^09[0-9]{9}$/)
    .required()
    .messages({
      "string.pattern.base": "Phone number must be a valid Iranian format",
    }),
  name: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  role: Joi.string().valid("USER", "ADMIN", "SHOP_MANAGER").default("USER"),
  isActive: Joi.boolean().default(true),
});

// 2. Schema for Updating Profile (User or Admin)
export const userUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  lastName: Joi.string().min(2).max(50).optional(),
  email: Joi.string().email().optional(),
  // Admin only fields (we will filter these out in controller for normal users)
  role: Joi.string().valid("USER", "ADMIN", "SHOP_MANAGER").optional(),
  isActive: Joi.boolean().optional(),
});
