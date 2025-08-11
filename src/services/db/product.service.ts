import { IProductsBody } from "../../features/product/interface/product.interface";
import { Product } from "../../generated/prisma";
import { UtilsConstant } from "../../globals/constants/utils";
import { Helper } from "../../globals/helpers/helpers";
import { checkpermission } from "../../globals/middlewares/auth.middleware";
import { notFoundExeption } from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class ProductService {
  public async add(
    requestBody: IProductsBody,
    currentUser: UserPayload,
    mainImage: Express.Multer.File | undefined
  ): Promise<Product> {
    const {
      name,
      longDescription,
      shortDescription,
      quantity,
      price,
      categoryId,
    } = requestBody;

    const product: Product = await prisma.product.create({
      data: {
        name,
        longDescription,
        shortDescription,
        quantity: parseInt(quantity),
        main_Image: mainImage?.filename ? mainImage.filename : "",
        categoryId: parseInt(categoryId),
        shopId: currentUser.id,
        price: parseFloat(price),
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
  //? => DRY ===> same work width getProduct 
  public async getOne(id: number): Promise<Product> {
    return this.getProduct(id);
  }

  public async edit(
    id: number,
    requestBody: IProductsBody,
    currentUser: UserPayload
  ): Promise<Product> {
    const {
      name,
      longDescription,
      shortDescription,
      main_Image,
      quantity,
      categoryId,
      price,
    } = requestBody;
    const currentProduct = await this.getProduct(id);

    Helper.checkPermission(currentProduct, currentUser);

    const product = await prisma.product.update({
      where: { id },
      data: {
        name,
        longDescription,
        shortDescription,
        main_Image,
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        price: parseFloat(price),
      },
    });
    return product;
  }

  private async getProduct(id: number): Promise<Product> {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new notFoundExeption(`product width id: ${id} not found!`);
    };

    return product;
  }

  public async remove(id: number, currentUser: UserPayload) {

    const currentProduct = await this.getProduct(id);

    Helper.checkPermission(currentProduct, currentUser);

    await prisma.product.delete({
      where: {
        id,
      },
    });
  }

  public async getMyProduct(currentUser: UserPayload) {
    const products = await prisma.product.findMany({
      where: { shopId: currentUser.id },
    });

    return products
  }
}

export const productService: ProductService = new ProductService();
