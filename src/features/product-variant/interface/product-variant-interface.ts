import {
  Product,
  ProductVariant,
  ProductVariantItems,
} from "../../../generated/prisma";

export interface IProtectVariantBody {
  name: string;
}

export interface IProductVariant extends ProductVariant {
  productVariantItems: ProductVariantItems[];
}

export interface IProduct extends Product {
  productVariants: ProductVariant[];
}
