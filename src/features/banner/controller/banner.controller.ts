import { Request, Response } from "express";
import { bannerService } from "../../../services/db/banner.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { BadRequestException } from "../../../globals/middlewares/error.middleware";

class BannerController {
  public async create(req: Request, res: Response) {
    if (!req.file) {
      throw new BadRequestException("لطفاً یک تصویر برای بنر آپلود کنید.");
    }
    const banner = await bannerService.create(req.body, req.file);
    return res.status(HTTP_STATUS.create).json({
      message: "بنر با موفقیت ایجاد شد.",
      data: banner,
    });
  }

  public async getAll(req: Request, res: Response) {
    const banners = await bannerService.getAll();
    return res.status(HTTP_STATUS.ok).json({
      message: "بنرها با موفقیت دریافت شدند.",
      data: banners,
    });
  }

  public async delete(req: Request, res: Response) {
    const bannerId = parseInt(req.params.id);
    await bannerService.delete(bannerId);
    return res.status(HTTP_STATUS.ok).json({
      message: "بنر با موفقیت حذف شد.",
    });
  }
}

export const bannerController: BannerController = new BannerController();