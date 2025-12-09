// import { Express } from "express";
import { prisma } from "../../prisma";
import { fileRemoveService } from "./file-remove.service";
import { notFoundExeption } from "../../globals/middlewares/error.middleware";
import { ICreateBanner, IUpdateBanner } from "../../features/banner/interface/banner.interface";
import path from "path";
import { BannerPosition } from "@prisma/client";

class BannerService {
  //! create
  public async create(data: ICreateBanner, imageUrl: string) {
    return await prisma.banner.create({
      data: {
        imageUrl: imageUrl,
        link: data.link,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
        position: data.position as BannerPosition,
      },
    });
  }

  //! get all 
  public async getAllPublic(position?: string) {
    const whereClause: any ={
      isActive: true,
    }

    if (position && Object.values(BannerPosition).includes(position as any)) {
      whereClause.position = position as BannerPosition;
    }

    return await prisma.banner.findMany({
      where: whereClause,
      orderBy: {id: "desc"},
    });
  }

  //! get all admin-all
  public async getAllAdmin() {
    return await prisma.banner.findMany({
      orderBy: {id: "desc"},
    });
  }

  //! delete
  public async delete(id: string) {
    const banner = await prisma.banner.findUnique({where: {id}});
    if (!banner) throw new notFoundExeption("بنر یافت نشد");

    const filename = path.basename(banner.imageUrl);
    await fileRemoveService.deleteUpload(filename, "banners");

    await prisma.banner.delete({where: {id}});
  }

  //! update
  public async update(id: string, data: IUpdateBanner) {
    return await prisma.banner.update({
      where: {id},
      data: data
    });
  }
} 

export const bannerService: BannerService = new BannerService();
