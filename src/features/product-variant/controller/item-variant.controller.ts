import { NextFunction, Request, Response } from "express";
import { productVariantItemService } from "../../../services/db/product-variant-item.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class ProductVariantItemController {
  public async addItem(req: Request, res: Response, next: NextFunction) {
    const productId = parseInt(req.params.productId);
    const variantId = parseInt(req.params.variantId);

    const variantItem = await productVariantItemService.add(
      productId,
      variantId,
      req.body,
      req.currentUser
    );

    return res.status(201).json({
      message: "variant item created successfully",
      data: variantItem,
    });
  }

  public async delete(req: Request, res: Response) {
    const productId = parseInt(req.params.productId);
    const variantId = parseInt(req.params.variantId);
    const variantItemId = parseInt(req.params.variantItemId);

    await productVariantItemService.remove(
      productId,
      variantId,
      variantItemId,
      req.currentUser
    );

    return res.status(HTTP_STATUS.ok).json({
      message: "remove variant item is successfully",
    });
  }
}

export const productVariantItemController: ProductVariantItemController =
  new ProductVariantItemController();
