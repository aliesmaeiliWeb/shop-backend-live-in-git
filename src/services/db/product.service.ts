import path from "path";
import {
  IProductCreate,
  IProductUpdate,
} from "../../features/product/interface/product.interface";
import { Prisma } from "../../generated/prisma";
import {
  BadRequestException,
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

  //! create with price history log
  public async createProduct(
    data: IProductCreate,
    ownerId: string,
    mainImageUrl: string,
    galleryImageUrls: string[],
  ) {
    const slug = this.generateSlug(data.name);

    return await prisma.$transaction(async (tx) => {
      //? check sku 
      if (data.skus && data.skus.length > 0) {
        const skuCode =data.skus.map((s) => s.sku);
        const existingSku = await tx.productSKU.findFirst({
          where: {sku: {in: skuCode}},
        });
        if (existingSku) {
          throw new BadRequestException(`کد SKU تکراری است: ${existingSku.sku}`);
        }
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
          }))
        })
      }

      //? create skus
      if (data.skus && data.skus.length > 0) {
        for (const sku of data.skus) {
          await tx.productSKU.create({
            data: {
              productId: product.id,
              sku: sku.sku,
              price: Number(sku.price),
              quantity: Number(sku.quantity),
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

      return product;
    });
  }

  //! update with price tracking
  public async updateProduct(
    id: string,
    data: IProductUpdate,
    userId: string, // who is updating
    newMainImage?: string
  ) {
    const product = await this.findProductById(id);

    return await prisma.$transaction(async (tx) => {
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

      return await tx.product.update({
        where: { id },
        data: {
          name: data.name,
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
      });
    });
  }

  //! advanced get all filter engine
  public async getAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const { search, categoryId, minPrice, maxPrice, sort } = query;

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
        include: {
          category: { select: { name: true, slug: true } },
          skus: {
            where: { deletedAt: null },
            select: { price: true, quantity: true },
          },
        },
      }),
      prisma.product.count({ where: whereClause }),
    ]);

    return {
      data: products,
      total,
      totalpages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  //! soft delete
  public async softDelete(id: string, ownerId: string, role: string) {
    const product = await this.findProductById(id);

    if (role !== "ADMIN" && product.ownerId !== ownerId) {
      throw new unauthorizedExeption("شما به این بخش اجازه دسترسی ندارید");
    }

    //? instead of delate(), we update deletedAt
    await prisma.product.update({
      where: { id },
      data: { deleteAt: new Date() },
    });

    //? optional : sort delete all skus too
    await prisma.productSKU.updateMany({
      where: { productId: id },
      data: { deletedAt: new Date() },
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
        skus: { where: { deletedAt: null } }, // exclude deleted skus
        priceHistory: { orderBy: { createdAt: "desc" }, take: 5 }, // show last 5 price changes
        attributes: {
          include: { attributeValue: { include: { attribute: true } } },
        },
        comments: true,
      },
    });

    if (!product) throw new notFoundExeption("محصولی یافت نشد");
    return product;
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
      where: {id: galleryId},
    });
    if (!img) throw new notFoundExeption("تصویری یافت نشد");

    //? remove file from disk
    const filename = path.basename(img.imageUrl);
    await fileRemoveService.deleteUpload(filename, "products");

    //? removefile for db
    await prisma.productGallery.delete({where: {id: galleryId}});
  }

  //! for adding sku later
  public async addSkuToProduct(productId: string, data: any) {
    return await prisma.productSKU.create({
      data:{
        productId,
        sku: data.sku,
        price: Number(data.price),
        quantity: Number(data.quantity),
        attributesJson: data.attributes,
      },
    });
  }
}

export const productService: ProductService = new ProductService();
