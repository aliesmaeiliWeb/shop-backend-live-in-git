import { IProductsBody } from "../../features/product/interface/product.interface";
import { Product } from "../../generated/prisma";
import { UtilsConstant } from "../../globals/constants/utils";
import { notFoundExeption } from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class ProductService {
  public async add(requestBody: IProductsBody): Promise<Product> {
    const {
      name,
      longDescription,
      shortDescription,
      quantity,
      main_Image,
      categoryId,
    } = requestBody;

    const product: Product = await prisma.product.create({
      data: {
        name,
        longDescription,
        shortDescription,
        quantity,
        main_Image,
        categoryId,
      },
    });
    return product;
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

  public async getOne(id: number): Promise<Product> {
    const product: Product | null = await prisma.product.findFirst({
      where: {
        id,
      },
    });

    if (!product) {
      throw new notFoundExeption(`product has ID: ${id} not found`);
    }

    return product;
  }

  public async edit(id: number, requestBody: IProductsBody): Promise<Product> {
    const {
      name,
      longDescription,
      shortDescription,
      main_Image,
      quantity,
      categoryId,
    } = requestBody;

    if ((await this.getCountProduct(id)) <= 0) {
      throw new notFoundExeption(`product has ${id} not found`);
    }

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        longDescription,
        shortDescription,
        main_Image,
        quantity,
        categoryId,
      },
    });
    return product;
  }

  public async remove(id: number) {
    await prisma.product.delete({
      where: {
        id,
      },
    });
  }

  private async getCountProduct(id: number) {
    const count: number = await prisma.product.count({
      where: { id },
    });

    return count;
  }
}

export const productService: ProductService = new ProductService();
