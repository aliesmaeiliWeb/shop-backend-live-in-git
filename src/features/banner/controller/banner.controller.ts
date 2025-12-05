import { Request, Response } from "express";
import { bannerService } from "../../../services/db/banner.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { BadRequestException } from "../../../globals/middlewares/error.middleware";

class BannerController {
  public async create(req: Request, res: Response) {
    if (!req.file) {
      throw new BadRequestException("Image file is required");
    }

    const imageUrl = `/image/banners/${req.file.filename}`;

    const banner = await bannerService.create(req.body, imageUrl);

    res.status(HTTP_STATUS.create).json({
      message: "Banner created successfully",
      data: banner,
    });
  }

  public async getAllPublic(req: Request, res: Response) {
    const banners = await bannerService.getAllPublic();
    res.status(HTTP_STATUS.ok).json({ data: banners });
  }

  public async getAllAdmin(req: Request, res: Response) {
    const banners = await bannerService.getAllAdmin();
    res.status(HTTP_STATUS.ok).json({ data: banners });
  }

  public async delete(req: Request, res: Response) {
    await bannerService.delete(req.params.id);
    res.status(HTTP_STATUS.ok).json({ message: "Banner deleted successfully" });
  }

  public async update(req: Request, res: Response) {
    const banner = await bannerService.update(req.params.id, req.body);
    res
      .status(HTTP_STATUS.ok)
      .json({ message: "Banner updated", data: banner });
  }
}

export const bannerController: BannerController = new BannerController();
