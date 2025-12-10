import Joi from "joi";

const skuSchema = Joi.object({
  
  id: Joi.string().optional().allow(null), 
  
  sku: Joi.string().required().messages({ "any.required": "کد SKU الزامی است" }),
  price: Joi.number().required().min(0),
  quantity: Joi.number().required().min(0),
  discountPercent: Joi.number().min(0).max(100).optional().default(0),
  attributes: Joi.object().optional(), 
})
.unknown(true);
export const productCreateSchema = Joi.object({
  name: Joi.string().required().min(3).max(200),
  shortDescription: Joi.string().optional().allow(""),
  longDescription: Joi.string().optional().allow(""),
  categoryId: Joi.string().uuid().required(), 
  basePrice: Joi.number().required().min(0),
  discountPercent: Joi.number().min(0).max(100).default(0),
  isAmazing: Joi.boolean().optional().default(false),

  enName: Joi.string().optional().allow(""),
  warranty: Joi.string().optional().allow(""),
  amazingExpiresAt: Joi.date().optional().allow(null),
  specifications: Joi.alternatives().try(Joi.object(), Joi.string()).optional(),

  skus: Joi.array().items(skuSchema).min(1).required().messages({
    "array.min": "حداقل یک SKU (تنوع محصول) باید وارد کنید",
    "any.required": "لیست SKU الزامی است"
  }),

  attributeValueIds: Joi.array().items(Joi.string()).optional(),
});

export const productUpdateSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  shortDescription: Joi.string().allow("").optional(),
  longDescription: Joi.string().allow("").optional(),
  categoryId: Joi.string().uuid().optional(),
  basePrice: Joi.number().min(0).optional(),
  discountPercent: Joi.number().min(0).max(100).optional(),
  isActive: Joi.boolean().optional(), 
  isAmazing: Joi.boolean().optional(),

  enName: Joi.string().optional().allow(""),
  warranty: Joi.string().optional().allow(""),
  amazingExpiresAt: Joi.date().optional().allow(null),
  specifications: Joi.alternatives().try(Joi.object(), Joi.string()).optional(),
  
  skus: Joi.array().items(skuSchema).optional(),
});