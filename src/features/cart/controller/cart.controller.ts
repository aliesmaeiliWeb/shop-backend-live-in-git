import { Request, Response } from "express";
import { cartService } from "../../../services/db/cart.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class CartController {
  public async addToCart(req: Request, res: Response) {
    const cart = await cartService.add(req.body, req.currentUser);

    return res.status(HTTP_STATUS.create).json({
      message: "product added to cart successfully",
      data: cart,
    });
  }

  public async getMyCart(req: Request, res: Response) {
    const cart = await cartService.get(req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "get my cart successfully",
      data: cart,
    });
  }

  public async updateCartItem(req: Request, res: Response) {
    const cartItemId = parseInt(req.params.id);
    const newQuantity = req.body;

    const cartItem = await cartService.updateItemQuantity(
      cartItemId,
      newQuantity,
      req.currentUser
    );

    return res.status(HTTP_STATUS.ok).json({
      message: "cart item updated successfully",
      data: cartItem,
    });
  }

  public async removeCartItem(req: Request, res: Response) {
    const cartItemId = parseInt(req.params.id);
    await cartService.removeItem(cartItemId, req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "cart item removed successfully",
    });
  }

  public async clearCart(req: Request, res: Response) {
    await cartService.clear(req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "cart cleared successfully",
    });
  }
}

export const cartController : CartController = new CartController();
