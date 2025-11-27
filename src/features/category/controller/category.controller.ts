import { Request, Response } from "express";
import { categoryService } from "../../../services/db/category.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class CategoryController {
  public async create(req: Request, res: Response) {
    const imageUrl = req.file
      ? `/uploads/category/${req.file.filename}`
      : undefined;
    //? Note: Ensure your Multer helper saves to 'uploads/category'

    const category = await categoryService.createCategory(req.body, imageUrl);
    res
      .status(HTTP_STATUS.create)
      .json({ message: "Category Created", data: category });
  }

  public async getAll(req: Request, res: Response) {
    const categories = await categoryService.getAllCategories();
    res.status(HTTP_STATUS.ok).json({ data: categories });
  }

  public async getOne(req: Request, res: Response) {
    const id = req.params.id;
    const category = await categoryService.getOneCategory(id);
    res.status(HTTP_STATUS.ok).json({ data: category });
  }

  public async update(req: Request, res: Response) {
    const id = req.params.id;
    const imageUrl = req.file
      ? `/uploads/category/${req.file.filename}`
      : undefined;

    const category = await categoryService.updateCategory(
      id,
      req.body,
      imageUrl
    );
    res
      .status(HTTP_STATUS.ok)
      .json({ message: "Category Updated", data: category });
  }

  public async delete(req: Request, res: Response) {
    const id = req.params.id;
    await categoryService.deleteCategory(id);
    res.status(HTTP_STATUS.ok).json({ message: "Category Deleted" });
  }
}

export const categoryController: CategoryController = new CategoryController();
