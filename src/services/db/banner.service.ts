// import { Express } from "express";
import { prisma } from "../../prisma";
import { fileRemoveService } from "./file-remove.service";
import { notFoundExeption } from "../../globals/middlewares/error.middleware";
import { ICreateBanner, IUpdateBanner } from "../../features/banner/interface/banner.interface";
import path from "path";

class BannerService {
  //! create
  public async create(data: ICreateBanner, imageUrl: string) {
    return await prisma.banner.create({
      data: {
        imageUrl: imageUrl,
        link: data.link,
        isActive: data.isActive !== undefined ? Boolean(data.isActive) : true,
      },
    });
  }

  //! get all 
  public async getAllPublic() {
    return await prisma.banner.findMany({
      where: {isActive: true},
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
