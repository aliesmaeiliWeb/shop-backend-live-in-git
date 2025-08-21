import { request } from "http";
import { prisma } from "../../prisma";
import { WishList } from "../../generated/prisma";
import {
  BadRequestException,
  notFoundExeption,
} from "../../globals/middlewares/error.middleware";
import { IWishlistBody } from "../../features/wishList/interface/wishlist.interface";

class WishlistService {
  public async add(
    requestBody: IWishlistBody,
    currentUser: UserPayload
  ): Promise<void> {
    const { productId } = requestBody;

    //+ check
    const wishlist = await this.getWishList(productId, currentUser.id);
    // to check for duplication
    if (wishlist) {
      throw new BadRequestException(
        `this product whith id : ${productId} alreadey exist`
      );
    }

    await prisma.wishList.create({
      data: {
        productId,
        userId: currentUser.id,
      },
    });
  }

  public async remove(productId: number, currentUser: UserPayload) {
    if ((await this.getCountWishlist(productId, currentUser.id)) <= 0) {
      throw new notFoundExeption(`product in wishlist not found`);
    }

    await prisma.wishList.delete({
      where: {
        userId_productId: {
          productId,
          userId: currentUser.id,
        },
      },
    });
  }

  public async get(currentUser: UserPayload): Promise<WishList[]> {
    const wishlist: WishList[] = await prisma.wishList.findMany({
        where:{
            userId: currentUser.id
        },
        include:{
            product: true,
        }
    });

    return wishlist
  }

  private async getWishList(
    productId: number,
    userId: number
  ): Promise<WishList | null> {
    const wishlist: WishList | null = await prisma.wishList.findFirst({
      where: {
        productId,
        userId,
      },
    });

    return wishlist;
  }

  private async getCountWishlist(
    productId: number,
    userId: number
  ): Promise<number> {
    const count: number = await prisma.wishList.count({
      where: {
        productId,
        userId,
      },
    });

    return count;
  }
}
export const wishlistService: WishlistService = new WishlistService();
