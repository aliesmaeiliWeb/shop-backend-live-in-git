import Joi, { optional } from "joi";

export const createOrderSchema = Joi.object({
  addressId: Joi.number().required().messages({
    "number.base": "شناسه آدرس باید یک عدد باشد.",
    "number.positive": "شناسه آدرس باید یک عدد مثبت باشد.",
    "any.required": "شناسه آدرس الزامی است.",
  }),
  description: Joi.string().allow("").optional(),
  couponCode: Joi.string().allow("").optional(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "PENDING",
      "PAID",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
      "REFUNDED"
    )
    .required()
    .messages({
      "any.only": "وضعیت ارسال شده معتبر نیست.",
      "any.required": "وضعیت الزامی است.",
    }),
  trackingCode: Joi.string().allow("").optional(),
});
