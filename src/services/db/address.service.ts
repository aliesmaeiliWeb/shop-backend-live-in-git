import { IAddressBody } from "../../features/address/interface/address.interface";
import { Address } from "../../generated/prisma";
import { Helper } from "../../globals/helpers/helpers";
import {
  BadRequestException,
  notFoundExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class AddressService {
  public async add(requestBody: IAddressBody, currentUser: UserPayload) {
    const { street, province, country, postalCode } = requestBody;

    const address: Address = await prisma.address.create({
      data: {
        street: street,
        postalCode: postalCode,
        province: province,
        country: country,
        user: {
          connect: {
            id: currentUser.id,
          },
        },
      },
    });

    return address;
  }

  public async update(id: number, requestBody: IAddressBody, currentUser: UserPayload):Promise<Address> {
    const { street, province, country, postalCode } = requestBody;

    const addressUpdate = await prisma.address.update({
      where: { id },
      data: {
        street: street,
        postalCode: postalCode,
        province: province,
        country: country,
      },
    });

    return addressUpdate;
  }

  public async remove(id: number, currentUser: UserPayload) {
    const address = await this.getOne(id);
    if (!address) {
      throw new notFoundExeption(`not found address width id : ${id}`);
    }

    Helper.checkPermission(address!, "userId", currentUser);

    await prisma.address.delete({
      where: { id },
    });
  }

  public async get(currentUser: UserPayload) {
    const address: Address[] = await prisma.address.findMany({
        where: {
            userId: currentUser.id
        }
    });

    return address;
  }

  private async getOne(id: number): Promise<Address | null> {
    const address = await prisma.address.findFirst({
      where: { id },
    });

    return address;
  }
}

export const addressService: AddressService = new AddressService();
