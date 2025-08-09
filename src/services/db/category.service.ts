import { ICategoryBody } from "../../features/category/interface/Category.interface";
import { Category } from "../../generated/prisma";
import { notFoundExeption } from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class CategoryServer {
  public async add(requestBody: ICategoryBody): Promise<Category> {
    const { name, icon, attributeIds } = requestBody; //? get for controller => req.body

    console.log("Received data for new category:", requestBody, attributeIds);

    const category: Category = await prisma.category.create({
      data: {
        name,
        icon,
        attributes: {
          //? connect attribute widht id's
          connect: attributeIds?.map((id) => ({ id })),
        },
      },
    });

    return category;
  }

  public async read(): Promise<Category[]> {
    const categories: Category[] = await prisma.category.findMany({
      include: {
        attributes: true,
      },
    });

    return categories;
  }

  public async readOne(id: number): Promise<Category> {
    const category = await prisma.category.findFirst({
      where: {
        id,
        status: true,
      },
      include: {
        attributes: true,
      },
    });
    if (!category) {
      throw new notFoundExeption(`category with id : ${id} not found`);
    }
    return category;
  }

  public async edit(id: number, requestBody: ICategoryBody) {
    const { name, icon, attributeIds } = requestBody;

    if ((await this.getCountCategory(id)) <= 0) {
      throw new notFoundExeption(`category with id : ${id} not found`);
    }

    const updatedCategory = await prisma.category.update({
      where: {
        id,
        // status: true,
      },
      data: {
        name,
        icon,
        attributes: attributeIds
          ? {
              set: attributeIds.map((attrId) => ({ id: Number(attrId) })),
            }
          : undefined,
      },
      include: {
        attributes: true,
      },
    });

    if (!updatedCategory) {
      throw new notFoundExeption(`category width id: ${id} not found`);
    }

    return updatedCategory;
  }

  public async remove(id: number) {
    if ((await this.getCountCategory(id)) <= 0) {
      throw new notFoundExeption(`category with id : ${id} not found`);
    }

    //? close relations this category when delete
    await prisma.category.update({
      where: { id },
      data: {
        attributes: {
          set: [],
        },
      },
    });

    await prisma.category.delete({
      where: {
        id,
      },
    });
  }

  private async getCountCategory(id: number): Promise<number> {
    const count = await prisma.category.count({
      where: {
        id,
      },
    });

    return count;
  }

  public async getAttributesOfCategory(id: number) {
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        //? get all object connect attributes
        attributes: true,
      },
    });

    if (!category) {
      throw new notFoundExeption(`Category with id: ${id} not found`);
    }
    return category.attributes;
  }
}

export const categoryServer: CategoryServer = new CategoryServer();
