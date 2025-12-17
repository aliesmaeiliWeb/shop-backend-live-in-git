import { IAddressBody } from "../../features/address/interface/address.interface";
import {
  notFoundExeption,
  unauthorizedExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class AddressService {
  //? private helper section
  private async findAddress(id: string) {
    const address = await prisma.address.findUnique({
      where: { id },
    });
    if (!address) throw new notFoundExeption("آدرسی یافت نشد");

    return address;
  }

  //? add address
  public async add(data: IAddressBody, userId: string) {
    const address = await prisma.address.create({
      data: {
        title: data.title,
        province: data.province,
        city: data.city,
        street: data.street,
        postalCode: data.postalCode,
        userId: userId,
        receiverName: data.receiverName,
        receiverPhone: data.receiverPhone,
      },
    });
    return address;
  }

  //? get all address
  public async getAll(userId: string) {
    return await prisma.address.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  //? update address
  public async update(id: string, data: IAddressBody, userId: string) {
    const address = await this.findAddress(id);

    if (address.userId !== userId) {
      throw new unauthorizedExeption(
        "برای به روز رسانی آدرس نیاز است که وارد بشوید"
      );
    }

    return await prisma.address.update({
      where: { id },
      data: {
        title: data.title,
        province: data.province,
        city: data.city,
        street: data.street,
        postalCode: data.postalCode,
      },
    });
  }

  //? remove address
  public async remove(id: string, userId: string) {
    const address = await this.findAddress(id);

    if (address.userId !== userId) {
      throw new unauthorizedExeption(
        "برای به روز رسانی آدرس نیاز است که وارد بشوید"
      );
    }

    await prisma.address.delete({ where: { id } });
  }
}

export const addressService: AddressService = new AddressService();
