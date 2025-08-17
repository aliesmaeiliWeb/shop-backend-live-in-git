import Joi from "joi";

export const createCommentSchema = Joi.object({
  text: Joi.string().min(3).required().messages({
    "string-min": "متن پیام باید بیشتر از 3 کاراکتر باشد",
    "any.required": "متن کامنت الزامی است",
  }),
  rating: Joi.number().integer().min(1).max(5).required().messages({
    "number-base": "امتیاز دهی باید عدد باشد",
    "number-min": "امتیاز نباید از 1 کمتر باشد",
    "number-max": "امتیاز دهی نباید از 5 بیشتر باشد",
    "any-required": "امتیاز الزامی است",
  }),
});

export const updateCommentStatusSchema = Joi.object({
  status: Joi.string().valid("APPROVED", "REJECTED").required(),
});
