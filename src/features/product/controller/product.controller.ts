import { Request, Response } from "express";
import { productService } from "../../../services/db/product.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { UtilsConstant } from "../../../globals/constants/utils";

class ProductController {
  //+ add product
  public async createBaseProduct(req: Request, res: Response) {
    const files = req.files as Express.Multer.File[];
    const product = await productService.creatBase(
      req.body,
      req.currentUser,
      files
    );

    return res.status(HTTP_STATUS.create).json({
      message: "create product",
      data: product,
    });
  }

  //+ read product
  public async getAll(req: Request, res: Response) {
    const result = await productService.getAll(req.query);

    return res.status(HTTP_STATUS.ok).json({
      message: "get product is successfully",
      ...result
    })
  }

  //+ readone product
  public async readOne(req: Request, res: Response) {
    const product = await productService.getOne(parseInt(req.params.id));

    res.status(HTTP_STATUS.ok).json({
      message: "get one product",
      data: product,
    });
  }

  //+ update product
  public async update(req: Request, res: Response) {
    const files = req.files as Express.Multer.File[];
    const product = await productService.edit(
      parseInt(req.params.id),
      req.body,
      req.currentUser,
      files
    );

    res.status(HTTP_STATUS.ok).json({
      message: "update product",
      data: product,
    });
  }

  //+ delete product
  public async delete(req: Request, res: Response) {
    await productService.remove(parseInt(req.params.id), req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "delete product",
    });
  }

  //+ delete image
  public async deleteImage(req: Request, res: Response) {
    const { productId } = req.params;
    const { imageUrl } = req.body;

    await productService.removeImage(parseInt(productId), imageUrl);

    return res.status(HTTP_STATUS.ok).json({
      message: "عکس با موفقیت حذف شد",
    });
  }

  // public async getProduct(req:Request, res: Response) {
  //   const {id} = req.params.id;

  //   const product = await productService.
  // }

  public async readMyProducts(req: Request, res: Response) {
    const products = await productService.getMyProduct(req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "Get my products",
      data: products,
    });
  }

  //+ add SKU
  public async addSku(req: Request, res: Response) {
    const sku = await productService.addSku(
      parseInt(req.params.id),
      req.body,
      req.currentUser
    );

    return res.status(HTTP_STATUS.create).json({
      message: "sku added successfully",
      data: sku,
    });
  }

  //+ edit SKU
  public async editSku(req: Request, res: Response) {
    const updatedSku = await productService.editSku(
      parseInt(req.params.skuId),
      req.body,
      req.currentUser
    );

    return res.status(HTTP_STATUS.ok).json({
      message: "sku updated successfully",
      data: updatedSku,
    });
  }

  //+ remove SKU
  public async removeSku(req: Request, res: Response) {
    await productService.removeSku(parseInt(req.params.skuId), req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "SKU removed successfully",
    });
  }
}

export const productController: ProductController = new ProductController();
