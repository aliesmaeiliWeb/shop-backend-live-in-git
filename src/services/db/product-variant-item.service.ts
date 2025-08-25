import { IProductVariant, IProtectVariantBody } from "../../features/product-variant/interface/product-variant-interface";
import { Product, ProductVariantItems } from "../../generated/prisma";
import { Helper } from "../../globals/helpers/helpers";
import { notFoundExeption } from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";
import { productService } from "./product.service";

class ProductVariantItemService {
  public async add(
    productId: number,
    variantId: number,
    requestBody: IProtectVariantBody,
    currentUser: UserPayload
  ): Promise<ProductVariantItems> {
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

    const variantItem: ProductVariantItems =
      await prisma.productVariantItems.create({
        data: {
          name,
          variantId,
        },
      });

    return variantItem;
  }

  public async remove(
    productId: number,
    variantId: number,
    variantItemId: number,
    currentUser: UserPayload
  ) {
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

    const variant: IProductVariant | null = await prisma.productVariant.findFirst({
      where: {
        id: variantId,
      },
      include: {
        productVariantItems: true,
      },
    });

    if (!variant) {
      throw new notFoundExeption(`product variantid : ${variantId} not found`);
    }

    // console.log(variant.productVariantItems);
    // console.log("check variant item id : ", variantItemId);

    const index = variant.productVariantItems.findIndex(
      (item: ProductVariantItems) => item.id === variantItemId
    );

    if (index <= -1) {
      throw new notFoundExeption(
        `product variant item id: ${variantItemId} not found`
      );
    }

    await prisma.productVariantItems.delete({
      where: { id: variantItemId },
    });
  }
}

export const productVariantItemService: ProductVariantItemService =
  new ProductVariantItemService();
