import { Request, Response } from "express";
import { cartService } from "../../../services/db/cart.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class CartController {
  public async addToCart(req: Request, res: Response) {
    await cartService.add(req.body, req.currentUser);

    return res.status(HTTP_STATUS.create).json({
      message: "add to cart",
    });
  }

  public async clearCart(req: Request, res: Response) {
    await cartService.clear(parseInt(req.params.id), req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "cart is deleted successfully",
    });
  }

  public async removeCartItem(req:Request, res:Response) {
    await cartService.removeItem(parseInt(req.params.id), req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "remove cart item successfully",
    });
  }

  public async getMyCart (req:Request, res:Response) {
    const cart = await cartService.get(req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "get my cart successfully",
      data: cart,
    })
  }
}

export const cartController: CartController = new CartController();
