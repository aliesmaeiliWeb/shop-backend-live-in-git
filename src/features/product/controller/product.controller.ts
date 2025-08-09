import { Request, Response } from "express";
import { productService } from "../../../services/db/product.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { UtilsConstant } from "../../../globals/constants/utils";

class ProductController {
  public async create(req: Request, res: Response) {
    const product = await productService.add(req.body);

    return res.status(HTTP_STATUS.create).json({
      message: "create product",
      data: product,
    });
  }

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
      const filterValueParams: string = req.query.filterValue as string;
    const [filterCondition, filterValue] = filterValueParams.split(".");
    
    const operation = ["lt", "lte", "gt", "gte"];

    if (filterCondition === 'eq') {
      where[filterBy] = parseInt(filterValue);
    }
    
    operation.forEach((operation) => {
      if (filterCondition === operation) {
        where[filterBy] = {};
        where[filterBy][filterCondition] = parseInt(filterValue);
      }
    });

    console.log(where);

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

  public async readOne(req: Request, res: Response) {
    const product = await productService.getOne(parseInt(req.params.id));

    res.status(HTTP_STATUS.ok).json({
      message: "get one product",
      data: product,
    });
  }

  public async update(req: Request, res: Response) {
    const product = await productService.edit(
      parseInt(req.params.id),
      req.body
    );

    res.status(HTTP_STATUS.ok).json({
      message: "update product",
      data: product,
    });
  }

  public async delete(req: Request, res: Response) {
    await productService.remove(parseInt(req.params.id));

    return res.status(HTTP_STATUS.ok).json({
      message: "delete product",
    });
  }
}

export const productController: ProductController = new ProductController();
