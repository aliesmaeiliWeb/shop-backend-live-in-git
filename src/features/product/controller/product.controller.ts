import { Request, Response } from "express";
import { productService } from "../../../services/db/product.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { UtilsConstant } from "../../../globals/constants/utils";

class ProductController {
  //! add product
  public async create(req: Request, res: Response) {
    const files = req.files as Express.Multer.File[];
    const product = await productService.add(req.body, req.currentUser, files);

    return res.status(HTTP_STATUS.create).json({
      message: "create product",
      data: product,
    });
  }

  //! read product
  public async read(req: Request, res: Response) {
    // const product = await productService.get(); //? normal get

    const page =
      parseInt(req.query.page as string) || UtilsConstant.Default_Page;
    const pageSize =
      parseInt(req.query.pageSize as string) || UtilsConstant.Default_Page_size;
    const sortBy =
      (req.query.sortBy as string) || UtilsConstant.Default_Sort_By;
    const sortDir =
      (req.query.sortDir as string) || UtilsConstant.Default_Sort_Dir;

    const where: any = {};
    const filterBy: string = req.query.filterBy as string;
    // const filterValueParams: string = req.query.filterValue as string;
    const filterValueParams = req.query.filterValue
      ? String(req.query.filterValue)
      : "";

    // console.log(filterValueParams, filterBy);

    if (filterBy && filterValueParams) {
      //+ "lt.5" ===> split("0") => ["lt", "5"]
      const [filterCondition, filterValue] = filterValueParams.split(".");

      const operation = ["lt", "lte", "gt", "gte"];

      if (filterCondition === "eq") {
        where[filterBy] = parseInt(filterValue);
      }

      if (operation.includes(filterCondition)) {
        where[filterBy] = { [filterCondition]: parseInt(filterValue) };
      }
      console.log("filter: ", filterCondition, filterValue);
    }

    const product = await productService.getPagination(
      page,
      pageSize,
      sortBy,
      sortDir,
      where
    ); //? pagination get

    return res.status(HTTP_STATUS.ok).json({
      message: "get all product successfully!",
      totalLegth: product.length,
      data: product,
    });
  }

  //! readone product
  public async readOne(req: Request, res: Response) {
    const product = await productService.getOne(parseInt(req.params.id));

    res.status(HTTP_STATUS.ok).json({
      message: "get one product",
      data: product,
    });
  }

  //! update product
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

  //! delete product
  public async delete(req: Request, res: Response) {
    await productService.remove(parseInt(req.params.id), req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "delete product",
    });
  }

  //! delete image
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
}

export const productController: ProductController = new ProductController();
