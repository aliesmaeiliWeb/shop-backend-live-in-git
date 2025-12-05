import { Request, Response } from "express";
import { wishlistService } from "../../../services/db/wishList.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class WishListController {
  // Handle the Toggle action
  public async toggle(req: Request, res: Response) {
    const { productId } = req.params;
    const userId = req.currentUser.id.toString();

    const result = await wishlistService.toggle(userId, productId);

    // We use 200 OK for both add and remove actions
    res.status(HTTP_STATUS.ok).json({
      message: result.message,
      data: { status: result.status },
    });
  }

  // Get all favorites
  public async getMyWishlist(req: Request, res: Response) {
    const wishlist = await wishlistService.getMyWishlist(
      req.currentUser.id.toString()
    );

    res.status(HTTP_STATUS.ok).json({
      message: "Wishlist fetched successfully",
      data: wishlist,
    });
  }

  // Check single status
  public async checkStatus(req: Request, res: Response) {
    const isInWishlist = await wishlistService.isInWishList(
      req.currentUser.id.toString(),
      req.params.productId
    );
    res.status(HTTP_STATUS.ok).json({ isInWishlist });
  }
}

export const wishListController: WishListController = new WishListController();
