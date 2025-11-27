import { Request, Response } from "express";
import { couponService } from "../../../services/db/coupon.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class CouponController {
  public async create(req: Request, res: Response) {
    const coupon = await couponService.create(req.body);
    res.status(HTTP_STATUS.create).json({
      message: "Coupon created successfully",
      data: coupon,
    });
  }

  public async getAll(req: Request, res: Response) {
    const coupons = await couponService.getAll();
    res.status(HTTP_STATUS.ok).json({ data: coupons });
  }

  public async getOne(req: Request, res: Response) {
    const coupon = await couponService.getOne(req.params.id);
    res.status(HTTP_STATUS.ok).json({ data: coupon });
  }

  public async update(req: Request, res: Response) {
    const coupon = await couponService.update(req.params.id, req.body);
    res.status(HTTP_STATUS.ok).json({
      message: "Coupon updated successfully",
      data: coupon,
    });
  }

  public async delete(req: Request, res: Response) {
    await couponService.delete(req.params.id);
    res.status(HTTP_STATUS.ok).json({ message: "Coupon deleted successfully" });
  }
}

export const couponController: CouponController = new CouponController();
