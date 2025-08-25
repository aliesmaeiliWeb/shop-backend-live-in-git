import { when } from "joi";
import { Cart, CartItem, Product, User } from "../../generated/prisma";
import { notFoundExeption } from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";
import { productService } from "./product.service";
import { userService } from "./user.service";
import { Helper } from "../../globals/helpers/helpers";
import { ICartBody } from "../../features/cart/interface/cart.interface";

class CartService {
  public async add(requestBody: ICartBody, currentUser: UserPayload) {
    const { totalPrice, productId, variant, quantity } = requestBody;

    //+ chech product exist
    const product: Product | null = await productService.getProduct(productId);

    if (!product) {
      throw new notFoundExeption(`product has id: ${productId} not found`);
    }

    //+ get user with cart
    const user: any | null = await userService.get(currentUser.id, {
      cart: true,
    });
    if (!user) {
      throw new notFoundExeption(
        `user dose not exist width id: ${currentUser.id}`
      );
    }

    //+ found orr creat cart
    let cart: any;

    //+ check if the user already has a cart , if not , creat a new one . and connect it to the current user
    if (user.cart) {
      const existingCart: Cart | null = await this.getCart(user.cart.id, {
        cartItem: true,
      });

      if (!existingCart) {
        throw new notFoundExeption(`cart does not existing`);
      }
      cart = existingCart;
    } else {
      cart = await prisma.cart.create({
        data: {
          totalPrice: 0,
          user: {
            connect: { id: currentUser.id },
          },
        },
      });
    }

    //+ find the index of the produt in the car , this hepls to determine if we need to update an existing item or add a new one
    const itemIndex: number =
      cart?.cartItem?.findIndex((item: any) => item.productId === productId) ??
      -1;

    let cartItem: CartItem;

    if (itemIndex <= -1) {
      cartItem = await prisma.cartItem.create({
        data: {
          productId,
          variant,
          cartId: cart.id,
          price: product.price,
          quantity,
        },
      });
    } else {
      //+ get the existing cart item from the database . to ensure we have the correct quantity before updating
      const currentCartId = await this.getCartItemByProduct(productId, cart.id);

      if (!currentCartId) {
        throw new notFoundExeption(`cart item not found`);
      }
      cartItem = await prisma.cartItem.update({
        where: { id: currentCartId.id },
        data: {
          quantity: currentCartId.quantity + (quantity || 1),
        },
      });
    }

    //+ recalculate the cart's total priceT after a new item has been added or an existing item's quantity has been updated
    const currentCart: Cart | null = await this.getCart(cartItem.cartId, {
      cartItem: true,
    });

    if (!currentCart) {
      throw new notFoundExeption(`cart with id: ${cartItem.id} not exist`);
    }

    //+ update total price for all products
    const allItems = await prisma.cartItem.findMany({
      where: { cartId: cart.id },
    });

    const newTotal = allItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    await prisma.cart.update({
      where: { id: cart.id },
      data: {
        totalPrice: newTotal,
      },
      // currentCart.totalPrice + cartItem.price
    });
  }

  public async clear(cartId: number, currentUser: UserPayload) {
    const cart: Cart | null = await this.getCart(cartId);

    if (!cart) {
      throw new notFoundExeption(`cart id : ${cartId} not found`);
    }

    Helper.checkPermission(cart, "userId", currentUser);

    await prisma.cart.delete({
      where: {
        id: cartId,
      },
    });
  }

  public async removeItem(cartItemId: number, currentUser: UserPayload) {
    const cartItem: CartItem | null = await this.getCartItem(cartItemId, {
      cart: true,
    });

    if (!cartItem) {
      throw new notFoundExeption(`cart item id: ${cartItemId} not found`);
    }

    Helper.checkPermission(cartItem, "userId", currentUser);

    await prisma.cartItem.delete({
      where: { id: cartItemId },
    });

    //+ get all items after delete
    const allItems = await prisma.cartItem.findMany({
      where: { cartId: cartItem.cartId },
    });

    //+ render total price again
    const newTotal = allItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    //+ updateCart
    await prisma.cart.update({
      where: { id: cartItem.cartId },
      data: {
        totalPrice: newTotal,
      },
    });
  }

  public async get(currentUser: UserPayload) {
    const cart = await prisma.cart.findFirst({
      where: { userId: currentUser.id },
      include: {
        cartItem: {
          include: {
            product: true,
          },
        },
      },
    });

    return this.returnCart(cart);
  }

  //+ a helper function to retrive a user's cart by its Id, with an option to includerelated data
  // private async getCart(cartId: number, include = {}) {
  //   const cart: Cart | null = await prisma.cart.findFirst({
  //     where: { id: cartId },
  //     include,
  //   });

  //   return cart;
  // }
  private async getCart(cartId: number, include?: any) {
    const query: any = {
      where: { id: cartId },
    };

    if (include && Object.keys(include).length > 0) {
      query.include = include;
    }

    const cart: Cart | null = await prisma.cart.findFirst(query);
    return cart;
  }

  //+ a helper funciton to fethc a specific cart item by ites id
  //+ not optional include ❌
  // private async getCartItem(cartItemId: number) {
  //   const cartItem: CartItem | null = await prisma.cartItem.findFirst({
  //     where: { id: cartItemId },
  //   });

  //   return cartItem;
  // }
  //+ optional include
  private async getCartItem(cartItemId: number, include?: any) {
    const query: any = {
      where: { id: cartItemId },
    };

    if (include && Object.keys(include).length > 0) {
      query.include = include;
    }

    const cartItem: CartItem | null = await prisma.cartItem.findFirst(query);
    return cartItem;
  }

  //+ a helper function to find an existing cart item for a specific product and cart Id
  private async getCartItemByProduct(productId: number, cartId: number) {
    const cartItem: CartItem | null = await prisma.cartItem.findFirst({
      where: { productId, cartId },
    });

    return cartItem;
  }

  private async returnCart(cart: any) {
    const cartItem = cart.cartItem.map((item: any) => {
      return {
        ...item,
        productName: item.product.name,
        productImage: item.product.main_Image,
        product: undefined,
      };
    });
    return {
      ...cart,
      cartItem: cartItem,
    };
  }
}

export const cartService: CartService = new CartService();
