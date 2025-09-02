import path from "path";
import fs from "fs/promises";
import {
  ICreateSKUBody,
  IProductsBody,
} from "../../features/product/interface/product.interface";
import { Product, ProductSKU } from "../../generated/prisma";
import { UtilsConstant } from "../../globals/constants/utils";
import { Helper } from "../../globals/helpers/helpers";
import { checkpermission } from "../../globals/middlewares/auth.middleware";
import {
  notFoundExeption,
  unauthorizedExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";
import { fileRemoveService } from "./file-remove.service";
import { json } from "stream/consumers";
import myCatch from "../../cache/cache";
import flushProductsList from "../../cache/product.cache";

class ProductService {
  public async creatBase(
    requestBody: IProductsBody,
    currentUser: UserPayload,
    files: Express.Multer.File[]
  ): Promise<Product> {
    const {
      name,
      longDescription,
      shortDescription,
      price,
      categoryId,
      dynamicAttributes,
      discountPercentage,
    } = requestBody;

    const product: Product = await prisma.product.create({
      data: {
        name,
        longDescription,
        shortDescription,
        main_Image: JSON.stringify(files.map((file) => file.filename)),
        categoryId: parseInt(categoryId),
        shopId: currentUser.id,
        price: parseFloat(price),
        dynamicAttributes: JSON.stringify(dynamicAttributes),
        discountPercentage: parseInt(requestBody.discountPercentage!),
      },
    });

    flushProductsList();

    return product;
  }

  //+ add sku to product
  public async addSku(
    productId: number,
    requestBody: ICreateSKUBody,
    currentUser: UserPayload
  ): Promise<ProductSKU> {
    const { sku, price, quantity } = requestBody;
    const product = await this.getOne(productId);

    if (product.shopId !== currentUser.id) {
      throw new unauthorizedExeption("you are not the owner of this product");
    }

    return await prisma.productSKU.create({
      data: {
        productId,
        sku,
        price: parseFloat(price),
        quantity: parseInt(quantity),
      },
    });
  }

  public async editSku(
    skuId: number,
    requestBody: ICreateSKUBody,
    currentUser: UserPayload
  ): Promise<ProductSKU> {
    const { price, quantity } = requestBody;

    const sku = await prisma.productSKU.findUnique({
      where: { id: skuId },
      include: {
        product: true,
      },
    });

    if (!sku) {
      throw new notFoundExeption(`sku with id: ${skuId} not found`);
    }

    if (sku.product.shopId !== currentUser.id) {
      throw new unauthorizedExeption("you are not the owner of this product");
    }

    return await prisma.productSKU.update({
      where: { id: skuId },
      data: {
        price: price ? parseFloat(price) : undefined,
        quantity: quantity ? parseInt(quantity) : undefined,
      },
    });
  }

  public async removeSku(
    skuId: number,
    currentUser: UserPayload
  ): Promise<void> {
    const sku = await prisma.productSKU.findUnique({
      where: { id: skuId },
      include: { product: true },
    });

    if (!sku) {
      throw new notFoundExeption(`sku with id ${skuId} not found`);
    }

    if (sku.product.shopId !== currentUser.id) {
      throw new unauthorizedExeption("you are not the owner of this product");
    }

    await prisma.productSKU.delete({ where: { id: skuId } });
  }

  public async get(): Promise<Product[]> {
    const products: Product[] = await prisma.product.findMany();

    return products;
  }

  //! for pagination
  public async getPagination(
    page: number = UtilsConstant.Default_Page,
    pageSize: number = UtilsConstant.Default_Page_size,
    sortBy: string = UtilsConstant.Default_Sort_By,
    sortDir: string = UtilsConstant.Default_Sort_Dir,
    where = {}
  ) {
    //+ cache
    const cacheKey = `product:page${page}:size:${pageSize}:sortBy:${sortBy}:sortDir:${sortDir}:where:${JSON.stringify(
      where
    )}`;

    //+chech cache exist
    const cachedProducts = myCatch.get<Product[]>(cacheKey);
    if (cachedProducts) {
      return cachedProducts;
    }

    const skip: number = (page - 1) * pageSize; // (2 -1) *10 = 10 products
    const take: number = pageSize;

    const product: Product[] = await prisma.product.findMany({
      where,
      skip,
      take,
      orderBy: {
        [sortBy]: sortDir,
      },
    });
    return product;
  }
  //+ get product width all skus
  public async getOne(id: number): Promise<Product & { skus: ProductSKU[] }> {
    //+ cache
    const cacheKey = `product:${id}`;

    const cachedProduct = myCatch.get<Product & { skus: ProductSKU[] }>(
      cacheKey
    );
    if (cachedProduct) {
      return cachedProduct;
    }

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        skus: true,
      },
    });

    if (!product) {
      throw new notFoundExeption(`product with id : ${id} not found`);
    }
    return product;
  }

  public async edit(
    id: number,
    requestBody: IProductsBody,
    currentUser: UserPayload,
    files: Express.Multer.File[]
  ): Promise<Product> {
    const {
      name,
      longDescription,
      shortDescription,
      main_Image,
      categoryId,
      price,
      dynamicAttributes,
      discountPercentage,
    } = requestBody;
    const currentProduct = await this.getProduct(id);

    if (!currentProduct) {
      throw new notFoundExeption(`محصول با آیدی ${id} یافت نشد`);
    }

    Helper.checkPermission(currentProduct, "shopId", currentUser);

    const newImageFileName = files ? files.map((file) => file.filename) : [];
    const existingImage = JSON.parse(currentProduct.main_Image || "[]");
    const allImage = [...existingImage, ...newImageFileName];

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        longDescription,
        shortDescription,
        main_Image: JSON.stringify(allImage),
        category: categoryId
          ? { connect: { id: parseInt(categoryId) } }
          : undefined,
        price: price ? parseFloat(price) : undefined,
        dynamicAttributes: JSON.stringify(dynamicAttributes),
        discountPercentage: requestBody.discountPercentage
          ? parseInt(requestBody.discountPercentage)
          : undefined,
      },
    });

    myCatch.del(`product:${id}`);
    flushProductsList();

    return product;
  }

  public async getProduct(id: number): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        skus: true,
      },
    });

    if (!product) {
      throw new notFoundExeption(`product width id: ${id} not found!`);
    }

    return product;
  }

  public async remove(id: number, currentUser: UserPayload) {
    const currentProduct = await this.getProduct(id);

    Helper.checkPermission(currentProduct, "shopId", currentUser);

    await prisma.product.delete({
      where: {
        id,
      },
    });

    myCatch.del(`product:${id}`);
    flushProductsList();
  }

  public async removeImage(productId: number, imageUrlDelete: string) {
    const product = await prisma.product.findUnique({
      where: {
        id: productId,
      },
    });

    if (!product) {
      throw new notFoundExeption(`محصول با آیدی  ${productId} یافت نشد`);
    }

    const existingImage: string[] = JSON.parse(product.main_Image || "[]");
    const filenameToDelete = path.basename(imageUrlDelete);
    const updatedImage = existingImage.filter(
      (img) => path.basename(img) !== filenameToDelete
    );

    await prisma.product.update({
      where: {
        id: productId,
      },
      data: {
        main_Image: JSON.stringify(updatedImage),
      },
    });

    // try {
    //   const filePath = path.join(
    //     __dirname,
    //     "/image/products",
    //     filenameToDelete
    //   );
    //   await fs.unlink(filePath);
    // } catch (e) {
    //   console.error("خطا در حذف فایل");
    // }
    await fileRemoveService.deleteUpload(filenameToDelete, 'products');

    return { success: true };
  }

  // public async getProduct(id: number): Promise<Product | null> {
  //   const product: Product |null = await prisma.product.findFirst({
  //     where: {id}
  //   });

  //   if (!product) return null;
  //   return product
  // }

  public async getMyProduct(currentUser: UserPayload) {
    const products = await prisma.product.findMany({
      where: { shopId: currentUser.id },
    });

    return products;
  }
}

export const productService: ProductService = new ProductService();
