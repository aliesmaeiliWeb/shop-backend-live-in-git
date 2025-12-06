import { prisma } from "../../prisma";

import {
  BadRequestException,
  notFoundExeption,
} from "../../globals/middlewares/error.middleware";
import {
  ICategoryCreate,
  ICategoryUpdate,
} from "../../features/category/interface/Category.interface";

class CategoryService {
  //? --- HELPER: Slug Generator ---
  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-") // Remove special chars
      .replace(/[^\w\s\u0600-\u06FF-]/g, ""); // Replace spaces with -
  }

  private async findCategoryById(id: string) {
    const category = await prisma.category.findUnique({ where: { id } });
    if (!category) {
      throw new notFoundExeption(`دسته بندی با شناسه ${id} یافت نشد`);
    }
    return category;
  }

  private async checkSlugUnique(slug: string) {
    const existing = await prisma.category.findUnique({ where: { slug } });
    console.log(slug);
    if (existing) {
      throw new BadRequestException(
        "دسته بندی با این نام (Slug تکراری) موجود است."
      );
    }
  }

  public async createCategory(data: ICategoryCreate, imageUrl?: string) {
    const slug = this.generateSlug(data.name);

    await this.checkSlugUnique(slug);

    const category = await prisma.category.create({
      data: {
        name: data.name,
        slug: slug,
        parentId: data.parentId ? data.parentId : null,
        icon: data.icon || "",
        imageUrl: imageUrl || "",
      },
    });

    return category;
  }

  public async getAllCategories() {
    //? Fetch Tree Structure (Root -> Children)
    return await prisma.category.findMany({
      where: { parentId: null }, // Get only parents
      orderBy: { id: "asc" },
      include: {
        children: {
          orderBy: { id: "asc" },
          include: {
            children: {
              orderBy: { id: "asc" },
            }
          },
        },
      },
    });
  }

  public async getOneCategory(id: string) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { children: true },
    });

    if (!category) throw new notFoundExeption(`دسته بندی یافت نشد`);
    return category;
  }

  public async updateCategory(
    id: string,
    data: ICategoryUpdate,
    imageUrl?: string
  ) {
    const category = await this.findCategoryById(id);

    let slug = category.slug;
    if (data.name && data.name !== category.name) {
      const newSlug = this.generateSlug(data.name);
      await this.checkSlugUnique(newSlug);
      slug = newSlug;
    }

    return await prisma.category.update({
      where: { id },
      data: {
        name: data.name,
        slug,
        parentId: data.parentId ? data.parentId : category.parentId,
        imageUrl: imageUrl || category.imageUrl,
        isActive: data.isActive ?? category.isActive,
      },
    });
  }

  public async deleteCategory(id: string) {
    //? Prevent deleting if it has children
    await this.findCategoryById(id);
    const hasChildren = await prisma.category.findFirst({
      where: { parentId: id },
    });

    //? check if it has products
    const hsaProducts = await prisma.product.findFirst({where: {categoryId: id}});
    if (hsaProducts) {
      throw new BadRequestException("این دسته بندی دارای محصول می باشد و قابل حذف نیست.");
    };

    if (hasChildren) {
      throw new BadRequestException(
        "Cannot delete category with sub-categories. Delete them first."
      );
    }

    await prisma.category.delete({ where: { id } });
  }
}

export const categoryService: CategoryService = new CategoryService();
