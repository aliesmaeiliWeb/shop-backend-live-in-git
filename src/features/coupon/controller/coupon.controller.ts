import { Request, Response } from "express";
import { couponService } from "../../../services/db/coupon.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class CouponController {
  //+ create coupon
  public async create(req: Request, res: Response) {
    const coupon = await couponService.createCoupon(req.body);

    return res.status(HTTP_STATUS.create).json({
      message: "coupon created successfully",
      data: coupon,
    });
  }

  //+ get all coupons
  public async getAll(req: Request, res: Response) {
    const coupons = await couponService.getAllCoupon();

    return res.status(HTTP_STATUS.ok).json({
      message: "coupons get successfully",
      data: coupons,
    });
  }

  //+ get one coupon by id
  public async getOne(req: Request, res: Response) {
    const couponId = parseInt(req.params.id);
    const coupon = await couponService.getCouponById(couponId);

    return res.status(HTTP_STATUS.ok).json({
      message: "coupon get one successfully",
      data: coupon,
    });
  }

  //+ update coupon
  public async update(req: Request, res: Response) {
    const couponId = parseInt(req.params.id);
    const updatedCoupon = await couponService.updateCoupon(couponId, req.body);

    return res.status(HTTP_STATUS.ok).json({
      message: "coupon updated successfully",
      data: updatedCoupon,
    });
  }

  //+ delete coupon
  public async delete(req: Request, res: Response) {
    const couponId = parseInt(req.params.id);
    await couponService.deleteCoupon(couponId);

    return res.status(HTTP_STATUS.ok).json({
      message: "coupon deleted successfully",
    });
  }
}

export const couponController: CouponController = new CouponController();
