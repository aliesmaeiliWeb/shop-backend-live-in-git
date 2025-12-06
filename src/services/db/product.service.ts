import path from "path";
import {
  IProductCreate,
  IProductUpdate,
} from "../../features/product/interface/product.interface";
import { Prisma, Role } from "@prisma/client";
import {
  BadRequestException,
  CustomError,
  notFoundExeption,
  unauthorizedExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";
import { fileRemoveService } from "./file-remove.service";

class ProductService {
  private generateSlug(name: string): string {
    return (
      name
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-") +
      "-" +
      Date.now().toString().slice(-4)
    );
  }

  private async findProductById(id: string) {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) throw new notFoundExeption("محصولی یافت نشد");

    return product;
  }

  private transformProduct(product: any) {
    if (!product) return null;
    const parentDiscount = product.discountPercent || 0;
    const parentFinalPrice =
      product.basePrice - (product.basePrice * parentDiscount) / 100;

    //? calculate final price for each sku
    let transformedSkus = [];
    if (product.skus) {
      transformedSkus = product.skus.map((sku: any) => {
        const skuDiscount = sku.discountPercent || 0;

        const finalPrice = sku.finalPrice
          ? sku.finalPrice
          : sku.price - (sku.price * skuDiscount) / 100;

        return {
          ...sku,
          finalPrice: finalPrice,
          appliedDiscount: skuDiscount,
        };
      });
    }

    return { ...product, finalPrice: parentFinalPrice, skus: transformedSkus };
  }

  //! create with price history log
  public async createProduct(
    data: IProductCreate,
    ownerId: string,
    mainImageUrl: string,
    galleryImageUrls: string[]
  ) {
    const slug = this.generateSlug(data.name);

    try {
      const createdProductId = await prisma.$transaction(async (tx) => {
        //? check sku
        if (data.skus && data.skus.length > 0) {
          const skuCode = data.skus.map((s) => s.sku);
          const existingSku = await tx.productSKU.findFirst({
            where: { sku: { in: skuCode } },
          });

          if (existingSku)
            throw new BadRequestException("کد اس کایو تکراری است");
        }

        //? create the parent product
        const product = await tx.product.create({
          data: {
            name: data.name,
            slug: slug,
            shortDescription: data.shortDescription,
            longDescription: data.longDescription,
            mainImage: mainImageUrl,
            basePrice: Number(data.basePrice),
            discountPercent: data.discountPercent
              ? Number(data.discountPercent)
              : 0,
            categoryId: data.categoryId,
            ownerId: ownerId,
          },
        });

        //? log initial price
        await tx.productPriceHistory.create({
          data: {
            productId: product.id,
            oldPrice: 0,
            newPrice: Number(data.basePrice),
            changedBy: ownerId,
          },
        });

        //? save gallery images
        if (galleryImageUrls.length > 0) {
          await tx.productGallery.createMany({
            data: galleryImageUrls.map((url) => ({
              productId: product.id,
              imageUrl: url,
            })),
          });
        }

        //? create skus
        if (data.skus && data.skus.length > 0) {
          for (const sku of data.skus) {
            const price = Number(sku.price);
            const discount = Number(sku.discountPercent || 0);
            const finalPrice = price - (price * discount) / 100;

            await tx.productSKU.create({
              data: {
                productId: product.id,
                sku: sku.sku,
                price: price,
                quantity: Number(sku.quantity),
                discountPercent: discount,
                finalPrice: finalPrice,
                attributesJson: sku.attributes,
              },
            });
          }
        }

        //? link attributes for filtering
        if (data.attributeValueIds && data.attributeValueIds.length > 0) {
          const uniqueIds = [...new Set(data.attributeValueIds)];
          for (const valId of uniqueIds) {
            const exists = await tx.attributeValue.findUnique({
              where: { id: valId },
            });
            if (exists) {
              await tx.productAttribute.create({
                data: {
                  productId: product.id,
                  attributeValueId: valId,
                },
              });
            }
          }
        }

        return product.id;
      });

      //? fetch and transform
      const fullProduct = await prisma.product.findUnique({
        where: { id: createdProductId },
        include: {
          gallery: true,
          skus: true,
          category: {
            select: { name: true },
          },
        },
      });

      return this.transformProduct(fullProduct);
    } catch (error: any) {
      console.error("create error product: ", error);
      if (error.code === "P2002") {
        const target = error.meta?.target;
        if (target && target.includes("slug"))
          throw new BadRequestException("Duplicate Product Name");
        if (target && target.includes("sku"))
          throw new BadRequestException("Duplicate SKU Code");
      }
      if (error instanceof CustomError) throw error;
      throw new Error("System Error Creating Product");
    }
  }

  //! update with price tracking
  public async updateProduct(
    id: string,
    data: IProductUpdate & { skus?: any[] },
    userId: string,
    newMainImage?: string,
    newGalleryImages?: string[]
  ) {
    //? find existing product
    const product = await this.findProductById(id);

    const updatedProduct = await prisma.$transaction(async (tx) => {
      //? handle slug change
      let newSlug = product.slug;
      if (data.name && data.name !== product.name) {
        newSlug = this.generateSlug(data.name);
      }

      if (newMainImage && product.mainImage) {
        const oldFilename = path.basename(product.mainImage);
        await fileRemoveService.deleteUpload(oldFilename, "products");
      }

      //? check if price changed
      if (data.basePrice && data.basePrice !== product.basePrice) {
        await tx.productPriceHistory.create({
          data: {
            productId: product.id,
            oldPrice: product.basePrice,
            newPrice: Number(data.basePrice),
            changedBy: userId,
          },
        });
      }

      //? handle main image cleanup
      if (newGalleryImages && newGalleryImages.length > 0) {
        const oldGallery = await tx.productGallery.findMany({
          where: { productId: id },
        });

        for (const img of oldGallery) {
          const filename = path.basename(img.imageUrl);
          await fileRemoveService.deleteUpload(filename, "products");
        }

        await tx.productGallery.deleteMany({
          where: { productId: id },
        });

        await tx.productGallery.createMany({
          data: newGalleryImages.map((url) => ({
            productId: product.id,
            imageUrl: url,
          })),
        });
      }

      //? handle sku updates
      if (data.skus && data.skus.length > 0) {
        for (const itemSku of data.skus) {
          const price = Number(itemSku.price);
          const discount =
            itemSku.discountPercent !== undefined
              ? Number(itemSku.discountPercent)
              : 0;
          const finalPrice = price - (price * discount) / 100;

          const existingSku = await tx.productSKU.findUnique({
            where: { sku: itemSku.sku },
          });

          if (existingSku) {
            //? update existing sku
            await tx.productSKU.update({
              where: { id: existingSku.id },
              data: {
                price: price,
                quantity: itemSku.quantity
                  ? Number(itemSku.quantity)
                  : undefined,
                discountPercent: discount,
                finalPrice: finalPrice,
                attributesJson: itemSku.attributes || undefined,
              },
            });
          } else {
            //? create new sku
            await tx.productSKU.create({
              data: {
                productId: product.id,
                sku: itemSku.sku,
                price: price,
                quantity: Number(itemSku.quantity),
                discountPercent: discount,
                finalPrice: finalPrice,
                attributesJson: itemSku.attributes,
              },
            });
          }
        }
      }

      return await tx.product.update({
        where: { id },
        data: {
          name: data.name || undefined,
          slug: newSlug,
          shortDescription: data.shortDescription,
          longDescription: data.longDescription,
          mainImage: newMainImage || product.mainImage,
          basePrice: data.basePrice ? Number(data.basePrice) : undefined,
          discountPercent: data.discountPercent
            ? Number(data.discountPercent)
            : undefined,
          isActive: data.isActive,
          categoryId: data.categoryId,
        },
        //? return full details including updated relations
        include: {
          gallery: true,
          skus: true,
        },
      });
    });

    return this.transformProduct(updatedProduct);
  }

  //! advanced get all filter engine
  public async getAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, categoryId, minPrice, maxPrice, sort, hasDiscount } = query;

    //? base filter always exclude deleted items sort default
    const whereClause: Prisma.ProductWhereInput = {
      deleteAt: null,
    };

    //? search
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    //? Category
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    //? price range
    if (minPrice || maxPrice) {
      whereClause.basePrice = {};
      if (minPrice) whereClause.basePrice.gte = Number(minPrice);
      if (maxPrice) whereClause.basePrice.lte = Number(maxPrice);
    }

    //? discount filter
    if (hasDiscount === "true") {
      whereClause.discountPercent = { gt: 0 };
    }

    //? sort
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price_asc") orderBy = { basePrice: "asc" };
    if (sort === "price_desc") orderBy = { basePrice: "desc" };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: orderBy,
        //? select minimal fields for product cart
        select: {
          id: true,
          name: true,
          slug: true,
          mainImage: true,
          basePrice: true,
          discountPercent: true,
          createdAt: true,
          gallery: {
            select: { imageUrl: true, id: true },
          },
          category: { select: { name: true, slug: true } },
          skus: {
            where: { deleteAt: null },
            select: { price: true, finalPrice: true, quantity: true },
            take: 1,
          },
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    const dataWithFinalPrice = products.map((p) => this.transformProduct(p));

    return {
      data: dataWithFinalPrice,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  //! soft delete
  public async softDelete(id: string, ownerId: string, role: string) {
    const product = await this.findProductById(id);

    if (role !== "ADMIN" && product.ownerId !== ownerId) {
      throw new unauthorizedExeption("شما به این بخش اجازه دسترسی ندارید");
    }

    //? instead of delate(), we update deleteAt
    await prisma.product.update({
      where: { id },
      data: { deleteAt: new Date() },
    });

    //? optional : sort delete all skus too
    await prisma.productSKU.updateMany({
      where: { productId: id },
      data: { deleteAt: new Date() },
    });
  }

  //! get one with details
  public async getOne(slugOrId: string) {
    const product = await prisma.product.findFirst({
      where: {
        AND: [
          { deleteAt: null }, // ensure its not deleted
          { OR: [{ slug: slugOrId }, { id: slugOrId }] },
        ],
      },
      include: {
        category: true,
        gallery: true,
        skus: { where: { deleteAt: null } }, // exclude deleted skus
        priceHistory: { orderBy: { createdAt: "desc" }, take: 5 }, // show last 5 price changes
        attributes: {
          include: { attributeValue: { include: { attribute: true } } },
        },
        comments: {
          where: { isApproved: true },
          take: 3,
          orderBy: { createdAt: "desc" },
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!product) throw new notFoundExeption("محصولی یافت نشد");
    return this.transformProduct(product);
  }

  //! get trashed products
  public async getTrashedProduct(query: any, ownerId: string, role: string) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, sort } = query;

    const whereClause: Prisma.ProductWhereInput = {
      deleteAt: { not: null },
    };

    if (role !== "ADMIN") {
      whereClause.ownerId = ownerId;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { shortDescription: { contains: search } },
      ];
    }

    let orderBy: any = { deleteAt: "desc" };

    if (sort === "price_asc") orderBy = { basePrice: "asc" };
    if (sort === "price_desc") orderBy = { basePrice: "desc" };
    if (sort === "oldest") orderBy = { deleteAt: "asc" };

    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: orderBy,
        select: {
          id: true,
          name: true,
          slug: true,
          mainImage: true,
          basePrice: true,
          deleteAt: true,
          category: { select: { name: true } },
          skus: {
            take: 1,
          },
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    const formattedProducts = products.map((p) => ({
      ...p,
      isDeleted: true,
    }));

    return {
      data: formattedProducts,
      pagination: {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
      },
    };
  }

  //! restore product
  public async restoreProduct(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new notFoundExeption("محصولی با این مشخصات یافت نشد");
    }

    await prisma.product.update({
      where: { id },
      data: { deleteAt: null },
    });

    await prisma.productSKU.updateMany({
      where: { productId: id },
      data: { deleteAt: null },
    });

    return { message: "محصول با موفقیت باز یابی شد" };
  }

  //! gallery helpers
  public async addImagesToGallery(productId: string, imageUrls: string[]) {
    return await prisma.productGallery.createMany({
      data: imageUrls.map((url) => ({ productId, imageUrl: url })),
    });
  }

  //! remove gallery
  public async removeGalleryImage(galleryId: string) {
    const img = await prisma.productGallery.findUnique({
      where: { id: galleryId },
    });
    if (!img) throw new notFoundExeption("تصویری یافت نشد");

    //? remove file from disk
    const filename = path.basename(img.imageUrl);
    await fileRemoveService.deleteUpload(filename, "products");

    //? removefile for db
    await prisma.productGallery.delete({ where: { id: galleryId } });
  }

  //! for adding sku later
  public async addSkuToProduct(productId: string, data: any) {
    return await prisma.productSKU.create({
      data: {
        productId,
        sku: data.sku,
        price: Number(data.price),
        quantity: Number(data.quantity),
        attributesJson: data.attributes,
      },
    });
  }

  //! delete sku
  public async deleteSku(skuId: string, userId: string, role: string) {
    const sku = await prisma.productSKU.findUnique({
      where: { id: skuId },
      include: { product: true },
    });

    if (!sku) {
      throw new notFoundExeption("آیتمی یافت نشد");
    }

    if (role !== "ADMIN" && sku.product.ownerId !== userId) {
      throw new unauthorizedExeption("شما اجازه حذف این آیتم را ندارید");
    }

    await prisma.productSKU.delete({
      where: { id: skuId },
    });
  }
}

export const productService: ProductService = new ProductService();
