import { NextFunction, Request, Response } from "express";
import { wishlistService } from "../../../services/db/wishList.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class WishListController {
  public async addWishlist(req: Request, res: Response, next: NextFunction) {
    await wishlistService.add(req.body, req.currentUser);

    return res.status(HTTP_STATUS.create).json({
      message: "add product to wishlist successfuly",
    });
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    await wishlistService.remove(
      parseInt(req.params.productId),
      req.currentUser
    );

    return res.status(HTTP_STATUS.ok).json({
      message: "product was removed from wishlist successfully",
    });
  }

  public async read(req: Request, res: Response) {
    const wishlist = await wishlistService.get(req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "get my wishlists",
      data: wishlist,
    });
  }
}

export const wishListController: WishListController = new WishListController();
