import Joi, { optional } from 'joi'

export const createOrderSchema = Joi.object({
    addressId: Joi.number().required(),
    description: Joi.string().allow('').optional(),
    couponCode: Joi.string().allow('').optional()
});