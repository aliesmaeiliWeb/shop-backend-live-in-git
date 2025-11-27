import { ICreateCoupon, IUpdateCoupon } from "../../features/coupon/interface/coupon.interface";
import {
  BadRequestException,
  notFoundExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class CouponService {
  //?Validates a coupon and returns the calculated discount amount.

  public async validateCoupon(
    code: string,
    cartTotal: number
  ): Promise<number> {
    const coupon = await prisma.coupon.findUnique({ where: { code } });

    // ? Existence Check
    if (!coupon) throw new BadRequestException("Invalid coupon code");

    // ? Active Check
    if (!coupon.isActive) throw new BadRequestException("Coupon is inactive");

    // ? Expiration Check
    if (new Date() > coupon.expiresAt)
      throw new BadRequestException("Coupon has expired");

    // ? Usage Limit Check
    if (coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestException("Coupon usage limit reached");
    }

    // ? Calculate Discount (Percentage)
    // ?Assuming 'percent' is stored as an integer (e.g., 10 for 10%)
    let discountAmount = (cartTotal * coupon.percent) / 100;

    // ? Apply Max Discount Cap (if exists)
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }

    return discountAmount;
  }

  ////////////////////////////////////////////////////////////////////

  //+ admin crud operation
  //! private helper section
  private async findCoupon(id: string) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new notFoundExeption("کپن موجود نیست");
    return coupon;
  }

  //! create
  public async create(data: ICreateCoupon) {
    const existing = await prisma.coupon.findUnique({
      where: { code: data.code },
    });
    if (existing) throw new BadRequestException("کد کپن موجود است");

    return await prisma.coupon.create({
      data: {
        code: data.code,
        percent: data.percent,
        maxDiscount: data.maxDiscount,
        usageLimit: data.usageLimit,
        expiresAt: new Date(data.expiresAt),
        isActive: true,
      },
    });
  }

  //! get all
  public async getAll() {
    return await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });
  }

  //! get one
  public async getOne(id: string) {
    return await this.findCoupon(id);
  }

  //! update 
  public async update(id: string, data: IUpdateCoupon) {
    await this.findCoupon(id);

    return await prisma.coupon.update({
      where: {id},
      data: {
        ...data,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      }
    });
  }

  //! delete
  public async delete(id: string) {
    await this.findCoupon(id);
    await prisma.coupon.delete({where: {id}});
  }
}

export const couponService: CouponService = new CouponService();
