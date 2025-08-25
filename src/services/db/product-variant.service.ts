import {
  IProduct,
  IProtectVariantBody,
} from "../../features/product-variant/interface/product-variant-interface";
import { Product, ProductVariant } from "../../generated/prisma";
import { Helper } from "../../globals/helpers/helpers";
import { notFoundExeption } from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";
import { productService } from "./product.service";

class ProductVariantService {
  public async add(
    productId: number,
    requestBody: IProtectVariantBody,
    currentUser: any
  ): Promise<ProductVariant> {
    const { name } = requestBody;

    //+ admin | shop(owner)
    const currentProduct: Product | null = await productService.getOne(
      productId
    );

    if (!currentProduct) {
      throw new notFoundExeption(
        `product has id : ${productId} dose not found`
      );
    }

    Helper.checkPermission(currentProduct!, 'userId', currentUser);

    const variant: ProductVariant = await prisma.productVariant.create({
      data: {
        name,
        productId,
      },
    });

    return variant;
  }

  public async delete(productId: number, variantId: number, currentUser: any) {
    const currentProduct: Product | null = await productService.getOne(
      productId
    );

    if (!currentProduct) {
      throw new notFoundExeption(
        `product has id : ${productId} dose not found`
      );
    }

    Helper.checkPermission(currentProduct!, 'userId', currentUser);

    const product: IProduct | null = await prisma.product.findFirst({
      where: { id: productId },
      include: {
        productVariants: true,
      },
    });

    const index = product!.productVariants.findIndex((item:ProductVariant) => item.id === variantId);

    if (index <= -1) {
      throw new notFoundExeption(`product variant has id : ${variantId} not found`);
    }

    await prisma.productVariant.delete({
      where: { id: variantId },
    });
  }
}

export const productVariantService: ProductVariantService =
  new ProductVariantService();
