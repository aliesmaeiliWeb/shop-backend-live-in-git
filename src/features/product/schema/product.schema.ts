import Joi from "joi";

// Validation for individual SKU items
const skuSchema = Joi.object({
  sku: Joi.string().required().messages({ "any.required": "کد SKU الزامی است" }),
  price: Joi.number().required().min(0),
  quantity: Joi.number().required().min(0),
  discountPercent: Joi.number().min(0).max(100).optional().default(0),
  attributes: Joi.object().optional(), // مثل { Color: "Red" }
});

// Validation for Create Product
export const productCreateSchema = Joi.object({
  name: Joi.string().required().min(3).max(200),
  shortDescription: Joi.string().optional().allow(""),
  longDescription: Joi.string().optional().allow(""),
  categoryId: Joi.string().uuid().required(), // Must be a valid UUID
  basePrice: Joi.number().required().min(0),
  discountPercent: Joi.number().min(0).max(100).default(0),

  // Must be an array of SKUs
  skus: Joi.array().items(skuSchema).min(1).required().messages({
    "array.min": "حداقل یک SKU (تنوع محصول) باید وارد کنید",
    "any.required": "لیست SKU الزامی است"
  }),

  // Optional array of strings (UUIDs)
  attributeValueIds: Joi.array().items(Joi.string()).optional(),
});

// Validation for Update Product
export const productUpdateSchema = Joi.object({
  name: Joi.string().min(3).optional(),
  shortDescription: Joi.string().allow("").optional(),
  longDescription: Joi.string().allow("").optional(),
  categoryId: Joi.string().uuid().optional(),
  basePrice: Joi.number().min(0).optional(),
  discountPercent: Joi.number().min(0).max(100).optional(),
  isActive: Joi.boolean().optional(), 
  skus: Joi.array().items(skuSchema).optional(),
});