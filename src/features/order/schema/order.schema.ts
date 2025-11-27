import Joi from "joi";

export const createOrderSchema = Joi.object({
  addressId: Joi.string().uuid().required().messages({
    "string.guid": "شناسه آدرس نامعتبر است.",
    "any.required": "انتخاب آدرس الزامی است.",
  }),
  note: Joi.string().max(500).allow("").optional(),
  couponCode: Joi.string().min(3).allow("").optional(),
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
    }),
  trackingCode: Joi.string().allow("").optional(), 
});