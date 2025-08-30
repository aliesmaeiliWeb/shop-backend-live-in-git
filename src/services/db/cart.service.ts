import {
  ICartBody,
  IUpdateCartItemBody,
} from "../../features/cart/interface/cart.interface";
import { Cart } from "../../generated/prisma";
import {
  BadRequestException,
  notFoundExeption,
  unauthorizedExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class CartService {
  //+ add to cart
  public async add(requestBody: ICartBody, currentUser: UserPayload) {
    const { productSKUId, quantity } = requestBody;

    //+ for check authentic quantity
    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException("quantity must be a positive integer");
    }

    //+ to make sure of being product sku
    const productSKU = await prisma.productSKU.findUnique({
      where: { id: productSKUId },
      include: { product: true },
    });

    if (!productSKU) {
      throw new notFoundExeption(
        `product sku with id: ${productSKUId} not found`
      );
    }

    //+ all operation in a secure environment
    return prisma.$transaction(async (tx) => {
      //+ found or create cart for user
      const cart = await this.getIrCreateCart(currentUser.id, tx);

      const existingItem = await tx.cartItem.findUnique({
        where: { cartId_productSKUId: { cartId: cart.id, productSKUId } },
      });

      const totalQuantity = (existingItem?.quantity || 0) + quantity;
      if (productSKU.quantity < totalQuantity) {
        throw new BadRequestException(
          `not enout stock. only ${productSKU.quantity} available.`
        );
      }

      //+ calculate final price by coupon
      let finalPrice = productSKU.price;
      if (productSKU.product.discountPercentage) {
        const discount =
          finalPrice * (productSKU.product.discountPercentage / 100);
        finalPrice = finalPrice - discount;
      }

      await tx.cartItem.upsert({
        where: { cartId_productSKUId: { cartId: cart.id, productSKUId } },
        create: {
          cartId: cart.id,
          productSKUId,
          quantity,
          price: finalPrice,
        },
        update: { quantity: { increment: quantity } },
      });

      //+ update total cart price
      await this.recalculateCartTotal(cart.id, tx);
    });
  }

  //+ get cart user
  public async get(currentUser: UserPayload) {
    const cart = await prisma.cart.findUnique({
      where: { userId: currentUser.id },
      include: {
        cartItem: {
          orderBy: { id: "desc" },
          include: {
            productSKU: {
              include: { product: true },
            },
          },
        },
      },
    });

    if (!cart) {
      return { id: null, userId: currentUser.id, totalPrice: 0, cartItem: [] };
    }
    return this.formatCartResponse(cart);
  }

  //+ update item
  public async updateItemQuantity(
    cartItemId: number,
    requestBody: IUpdateCartItemBody,
    currentUser: UserPayload
  ) {
    const { quantity } = requestBody;
    if (!quantity || !Number.isInteger(quantity) || quantity < 1) {
      throw new BadRequestException("quantity must be a postive integer.");
    }

    return prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: { id: cartItemId },
        include: {
          cart: true,
          productSKU: true,
        },
      });

      if (!cartItem) throw new notFoundExeption("cart item not found");
      if (cartItem.cart.userId !== currentUser.id)
        throw new unauthorizedExeption("access denied");
      if (cartItem.productSKU.quantity < quantity) {
        throw new BadRequestException(
          `Not enough stock. Only ${cartItem.productSKU.quantity} available.`
        );
      }

      await tx.cartItem.update({
        where: { id: cartItemId },
        data: { quantity: quantity },
      });

      await this.recalculateCartTotal(cartItem.cartId, tx);
    });
  }

  //+ remove item
  public async removeItem(cartItemId: number, currentUser: UserPayload) {
    return prisma.$transaction(async (tx) => {
      const cartItem = await tx.cartItem.findUnique({
        where: { id: cartItemId },
        include: { cart: true }, //+ for access to user id
      });

      if (!cartItem) throw new notFoundExeption("cart item not found");

      if (cartItem.cart.userId !== currentUser.id)
        throw new unauthorizedExeption("access deined");

      await tx.cartItem.delete({ where: { id: cartItemId } });
      await this.recalculateCartTotal(cartItem.cartId, tx);
    });
  }

  //+ clear all
  public async clear(currentUser: UserPayload) {
    const cart = await prisma.cart.findUnique({
      where: { userId: currentUser.id },
    });

    if (cart) {
      await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
      await prisma.cart.update({
        where: { id: cart.id },
        data: { totalPrice: 0 },
      });
    }
  }

  //! private data

  private async getIrCreateCart(userId: number, tx: any): Promise<Cart> {
    const cart = await tx.cart.findUnique({ where: { userId } });
    if (cart) return cart;
    return tx.cart.create({ data: { userId, totalPrice: 0 } });
  }

  private async recalculateCartTotal(cartId: number, tx: any) {
    const allItems = await tx.cartItem.findMany({
      where: { cartId: cartId },
    });
    const newTotal = allItems.reduce(
      (acc: any, item: any) => acc + item.price * item.quantity,
      0
    );
    await tx.cart.update({
      where: { id: cartId },
      data: { totalPrice: parseFloat(newTotal.toFixed(2)) },
    });
  }

  private formatCartResponse(cart: any) {
    const formattedItems = cart.cartItem.map((item: any) => ({
      cartItemId: item.id,
      quantity: item.quantity,
      pricePerItem: item.price,
      totalItemPrice: parseFloat((item.price * item.quantity).toFixed(2)),
      productName: item.productSKU.product.name,
      productImage: item.productSKU.product.main_Image,
      sku: item.productSKU.sku,
      productSKUId: item.productSKUId,
    }));

    return {
      cartId: cart.id,
      userId: cart.userId,
      totalPrice: cart.totalPrice,
      cartItems: formattedItems,
    };
  }
}

export const cartService: CartService = new CartService();
