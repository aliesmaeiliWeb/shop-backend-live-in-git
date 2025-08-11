import { Request, Response } from "express";
import { categoryServer } from "../../../services/db/category.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class CategoryController {
  public async create(req: Request, res: Response) {
    console.log("Controller - Request Body:", req.body);
  console.log("Controller - File:", req.file);
    const imageUrl = req.file ? `/uploads/categories/${req.file.filename}` : undefined;
    const category = await categoryServer.add(req.body, imageUrl!);
    return res.status(HTTP_STATUS.create).json({
      message: "Create Category",
      data: category,
    });
  }

  public async getAll(req: Request, res: Response) {
    const categories = await categoryServer.read();

    return res.status(HTTP_STATUS.ok).json({
      message: "Get All Categories",
      data: categories,
    });
  }

  public async get(req: Request, res: Response) {
    const catetory = await categoryServer.readOne(parseInt(req.params.id));

    return res.status(HTTP_STATUS.ok).json({
      message: "get category",
      data: catetory,
    });
  }

  public async update(req: Request, res: Response) {
    const imageUrl = req.file ? `/uploads/categories/${req.file.filename}` : undefined;
    const category = await categoryServer.edit(
      parseInt(req.params.id),
      req.body,
      imageUrl
    );

    return res.status(HTTP_STATUS.ok).json({
      message: "update category",
      data: category,
    });
  }

  public async delete(req: Request, res: Response) {
    const categoryDelete = await categoryServer.remove(parseInt(req.params.id));

    return res.status(HTTP_STATUS.ok).json({
      message: "Delete category",
    });
  }

  public async getAttribute (req:Request, res:Response) {
    const attribute = await categoryServer.getAttributesOfCategory(parseInt(req.params.id));

    res.status(HTTP_STATUS.ok).json({
      message: 'category attribute', 
      data:{
        attribute
      }
    })
  }
}

export const categoryController: CategoryController = new CategoryController();
