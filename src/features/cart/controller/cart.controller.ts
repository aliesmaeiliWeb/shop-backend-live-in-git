import { Request, Response } from "express";
import { cartService } from "../../../services/db/cart.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class CartController {
  //? get user's cart
  public async getMyCart(req:Request, res:Response) {
    const cart = await cartService.getCart(req.currentUser.id.toString());
    res.status(HTTP_STATUS.ok).json({data: cart});
  }

  //? add user's cart
  public async addToCart(req:Request, res:Response){
    const {skuId, quantity} = req.body;
    const cart = await cartService.addToCart(req.currentUser.id.toString(), skuId, quantity);

    res.status(HTTP_STATUS.create).json({
      message: "آیتم به سبد خرد اضافه شد",
      data: cart,
    });
  }

  //? updateitme quantity
  public async updateItemQuantity(req:Request, res:Response) {
    const {quantity} = req.body;
    const {itemId} = req.params;

    const cart = await cartService.updateItemQuantity(
      req.currentUser.id.toString(),
      itemId,
      quantity
    );

    res.status(HTTP_STATUS.ok).json({
      message: "کارت با موفقیت آپدیت شد",
      data: cart
    });
  }

  //? remove item from cart
  public async removeItem(req:Request, res:Response) {
    const {itemId} = req.params;
    const cart = await cartService.removeItem(req.params.id.toString(), itemId);

    res.status(HTTP_STATUS.ok).json({
      message: "آیتم با موفقیت حذف شد",
      data: cart
    });
  }

  //? sync guest cart
  public async syncCart(req:Request, res:Response) {
    const {item} = req.body;
    const cart = await cartService.syncGuestCart(req.currentUser.id.toString(), item);
    
    res.status(HTTP_STATUS.ok).json({
      message: "همگام سازی با موفقیت انجام شد",
      data: cart
    });
  }
}

export const cartController : CartController = new CartController();
