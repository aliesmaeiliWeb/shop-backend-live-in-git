import { ICouponBody } from "../../features/coupon/interface/coupon.interface";
import {
  BadRequestException,
  notFoundExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class CouponService {
  //+ create new coupon
  public async createCoupon(requestBody: ICouponBody) {
    const { code, discountType, value, expiresAt, usageLimit } = requestBody;

    //+ prevent duplicate code registration
    const existingCoupon = await prisma.coupon.findUnique({
      where: { code },
    });

    if (existingCoupon) {
      throw new BadRequestException("این کد تخفیف قبلاً ثبت شده است.");
    }

    if (discountType === "PERCENTAGE" && (value <= 0 || value > 100)) {
      throw new BadRequestException(
        "مقدار تخفیف درصدی باید بین ۱ تا ۱۰۰ باشد."
      );
    }

    return prisma.coupon.create({
      data: {
        code,
        discountType,
        value,
        expiresAt: expiresAt,
        usageLimit,
      },
    });
  }

  //+ returns all existing coupons
  public async getAllCoupon() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  //+ returns the details ofa specific coupon using its id
  public async getCouponById(couponId: number) {
    const coupon = await prisma.coupon.findUnique({
      where: { id: couponId },
    });

    if (!coupon) {
      throw new notFoundExeption("کوپن مورد نظر یافت نشد.");
    }
    return coupon;
  }

  //+ update coupon
  public async updateCoupon(
    couponId: number,
    requestBody: Partial<ICouponBody>
  ) {
    await this.getCouponById(couponId);

    return prisma.coupon.update({
      where: { id: couponId },
      data: {
        ...requestBody,
        expiresAt: requestBody.expiresAt
          ? new Date(requestBody.expiresAt)
          : undefined,
      },
    });
  }

  //+ remove coupon
  public async deleteCoupon(couponId: number) {
    await this.getCouponById(couponId);
    await prisma.coupon.delete({ where: { id: couponId } });
  }
}

export const couponService: CouponService = new CouponService();
