import Joi from "joi";

export const cartAddSchema = Joi.object({
  skuId: Joi.string().uuid().required().messages({
    "string.guid": "Invalid SKU ID format",
    "any.required": "SKU ID is required"
  }),
  quantity: Joi.number().integer().min(1).required().messages({
    "number.min": "Quantity must be at least 1"
  }),
});

export const cartUpdateQtySchema = Joi.object({
  quantity: Joi.number().integer().min(1).required(),
});

export const cartSyncSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      skuId: Joi.string().uuid().required(),
      quantity: Joi.number().integer().min(1).required(),
    })
  ).required(),
});