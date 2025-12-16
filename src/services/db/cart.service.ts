import { ICartSynceItem } from "../../features/cart/interface/cart.interface";
import {
  BadRequestException,
  notFoundExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class CartService {
  //? helper: recalculate cart total
  //+ this function is crucial. whenever an item is added , removed . or updated
  //+ we must re-calculate the total price of the cart to ensure consistency.
  private async recalculateCartTotal(cartId: string) {
    //? get all itmes in the cart with their current sku price
    const cart = await prisma.cart.findUnique({
      where: { id: cartId },
      include: {
        items: {
          include: {
            //? we need the real price from sku table
            productSKU: true,
          },
        },
      },
    });

    if (!cart) return;

    //? calculate total: Sum(quantity * price)
    let totalPrice = 0;
    for (const item of cart.items) {
      const originalPrice = item.productSKU.price;
      const discount = item.productSKU.discountPercent || 0;

      const realPrice = originalPrice - (originalPrice * discount / 100);
      totalPrice += item.quantity * realPrice;
    }

    //? update the cart table
    await prisma.cart.update({
      where: { id: cartId },
      data: { totalPrice },
    });
  }

  //! get cart with details
  public async getCart(userId: string) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          orderBy: {id: "asc"},
          include: {
            productSKU: {
              include: {
                product: {
                  //? minimal product info
                  select: { name: true, slug: true, mainImage: true },
                },
              },
            },
          },
        },
      },
    });

    return cart;
  }

  //! add to cart upsert logic
  //? handles creating a cart if it dosesn't checking stock, and marging quantities if the item is already there.
  public async addToCart(userId: string, skuId: string, quantity: number) {
    //? stock validation
    const sku = await prisma.productSKU.findUnique({ where: { id: skuId } });
    if (!sku) throw new notFoundExeption("محصولی با این شناسه موجود نیست");

    if (sku.quantity < quantity) {
      throw new BadRequestException(
        `موجودی کم میباشد فقط ${sku.quantity}باقی مانده است`
      );
    }

    //? find or create cart for user
    let cart = await prisma.cart.findUnique({
      where: { userId },
    });
    if (!cart) {
      cart = await prisma.cart.create({
        data: {
          userId,
          //? will be calculated shortly
          totalPrice: 0,
        },
      });
    }

    //? check if item already exists in this cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productSKUId: {
          cartId: cart.id,
          productSKUId: skuId,
        },
      },
    });

    if (existingItem) {
      //? logic: if exists, we add to the existing quantity
      const newQuantity = existingItem.quantity + quantity;

      //? re-check stock for the total new amount
      if (sku.quantity < newQuantity) {
        throw new BadRequestException(
          `تعداد آیتمی که اضافه کردید بیشتر از موجودی این محصول است`
        );
      }

      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQuantity },
      });
    } else {
      //? logic: create new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productSKUId: skuId,
          quantity: quantity,
        },
      });
    }

    // final step: recalculate total price
    await this.recalculateCartTotal(cart.id);
    return this.getCart(userId);
  }

  //! update quantity(direct set)
  //? used when user types a number or clicks +/- cart page
  public async updateItemQuantity(
    userId: string,
    cartItemId: string,
    quantity: number
  ) {
    //? get the item to check ownerShip and stock
    const item = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true, productSKU: true },
    });

    if (!item) throw new notFoundExeption("آیتمی در داخل سبد خرید پیدا نشد");
    if (item.cart.userId !== userId) {
      throw new BadRequestException(
        "دسترسی به این بخش برای شما مجاز نیست لطفا وارد بشوید"
      );
    }

    //? stock validation
    if (item.productSKU.quantity < quantity) {
      throw new BadRequestException(
        `حداکثر موجودی : ${item.productSKU.quantity} است`
      );
    }

    //? update
    await prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity },
    });

    //? recalculate
    await this.recalculateCartTotal(item.cartId);
    return this.getCart(userId);
  }

  //! remove item
  public async removeItem(userId: string, cartItemId: string) {
    //? find item to ensure it belongs to user
    const itme = await prisma.cartItem.findUnique({
      where: { id: cartItemId },
      include: { cart: true },
    });

    if (!itme) throw new notFoundExeption("آیتمی با این مشخصات یافت نشد");
    if (itme.cart.userId !== userId) {
      throw new BadRequestException("دسترسی شما به این بخش وارد شوید");
    }

    //? delete
    await prisma.cartItem.delete({ where: { id: cartItemId } });
    await this.recalculateCartTotal(itme.cartId);
    return this.getCart(userId);
  }

  //!sync guest cart
  //? takes items from localstorage (frontend) and merge them into db cart
  public async syncGuestCart(userId: string, guestItems: ICartSynceItem[]) {
    //? loop through guest items and use existing logic to add them safely
    //? this ensures stock is cheched and quantities are merged correctly
    if (!guestItems || !Array.isArray(guestItems)) {
        return this.getCart(userId);
    };
    
    for (const item of guestItems) {
      try {
        await this.addToCart(userId, item.skuId, item.quantity);
      } catch (error) {
        console.warn("خطا در همگام سازی سبد خرید");
        console.error(error);
      }
    }

    return this.getCart(userId);
  }
}

export const cartService: CartService = new CartService();
