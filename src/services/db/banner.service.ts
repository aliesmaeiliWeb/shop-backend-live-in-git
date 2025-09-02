import { Express } from "express";
import { IBannerBody } from "../../features/banner/interface/banner.interface";
import { prisma } from "../../prisma";
import { fileRemoveService } from "./file-remove.service";
import { notFoundExeption } from "../../globals/middlewares/error.middleware";

class BannerService {
  public async create(requestBody: IBannerBody, file: Express.Multer.File) {
    const { position, isActive, link, title } = requestBody;

    return prisma.banner.create({
      data: {
        position,
        isActive,
        link,
        title,
        imageUrl: file.filename,
      },
    });
  }

  public async getAll() {
    return prisma.banner.findMany({
      orderBy: { createdAt: "desc" },
    });
  }

  public async delete(BannerId: number) {
    const banner = await prisma.banner.findUnique({ where: { id: BannerId } });

    if (!banner) {
      throw new notFoundExeption("بنر مورد نظر یافت نشد.");
    }

    await fileRemoveService.deleteUpload(banner.imageUrl,'banners');
    await prisma.banner.delete({ where: { id: BannerId } });
  }
}

export const bannerService: BannerService = new BannerService();
