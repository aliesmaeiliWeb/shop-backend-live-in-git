import { NextFunction, Request, Response } from "express";
import { productVariantService } from "../../../services/db/product-variant.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class ProductVariantController {
  public async addVariant(req: Request, res: Response, next: NextFunction) {
    const variant = await productVariantService.add(
      parseInt(req.params.productId),
      req.body,
      req.currentUser
    );

    return res.status(HTTP_STATUS.create).json({
      message: "add product variant",
      data: variant,
    });
  }

  public async delete(req: Request, res: Response, next: NextFunction) {
    await productVariantService.delete(
      parseInt(req.params.productId),
      parseInt(req.params.variantId),
      req.currentUser
    );

    return res.status(HTTP_STATUS.ok).json({
      message: "delete product variant is successfully",
    });
  }
}

export const productVariantController: ProductVariantController =
  new ProductVariantController();
