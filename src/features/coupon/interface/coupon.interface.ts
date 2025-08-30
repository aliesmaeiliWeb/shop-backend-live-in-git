import { DiscountType } from "../../../generated/prisma";

export interface ICouponBody {
    code: string;
    discountType: DiscountType;
    value: number;
    expiresAt?: string;
    usageLimit?: number;
}