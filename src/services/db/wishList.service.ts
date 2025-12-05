import { prisma } from "../../prisma";
import { notFoundExeption } from "../../globals/middlewares/error.middleware";

class WishlistService {
  //! toggle wishlist item : if the item is already in the wishlist , remove it, if not , add it
  public async toggle(userId: string, productId: string) {
    //? check if the product actually exits
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new notFoundExeption("محصولی یافت نشد");
    }

    //? check if the item is already in the user's wisthlist
    const existingItem = await prisma.wishList.findUnique({
      where: {
        userId_productId: {
          userId,
          productId,
        },
      },
    });

    if (existingItem) {
      //? remove from wishlist
      await prisma.wishList.delete({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });
      return {
        status: "removed",
        message: "محصول از لیست علاقه مندی ها حذف شد",
      };
    } else {
      //? add to wishlist
      await prisma.wishList.create({
        data: {
          userId,
          productId,
        },
      });
      return {
        status: "added",
        message: "محصول به لیست علاقه مندی ها اضافه شد",
      };
    }
  }

  //! get user's wishlist: we need to return the product details(name, image, price)
  public async getMyWishlist(userId: string) {
    const wishlist = await prisma.wishList.findMany({
      where: { userId },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            mainImage: true,
            basePrice: true,
            discountPercent: true,
          },
        },
      },
    });

    return wishlist;
  }

  //! check specific product status :Used when loading a single product page to see if the heart should be red or white
  public async isInWishList(userId: string, productId: string) {
    const item = await prisma.wishList.findUnique({
      where: {
        userId_productId: { userId, productId },
      },
    });

    return !!item; // returnd true or false
  }
}
export const wishlistService: WishlistService = new WishlistService();
