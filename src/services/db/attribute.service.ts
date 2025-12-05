import { IAttributeCreate, IAttributeValueCreate } from "../../features/category/interface/attribute.interface";
import { BadRequestException, notFoundExeption } from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class AttributeService {
   public async createAttribute(data: IAttributeCreate) {
    //? Check if name exists (e.g. "Color")
    const exists = await prisma.attribute.findUnique({
      where: { name: data.name },
    });
    if (exists) throw new BadRequestException("Attribute already exists");

    return await prisma.attribute.create({
      data: { name: data.name },
    });
  }

  public async addValueToAttribute(id: string, data: IAttributeValueCreate) {
    //? Check if attribute exists
    const attribute = await prisma.attribute.findUnique({ where: { id } });
    if (!attribute) throw new notFoundExeption("Attribute not found");

    //? Create the value (e.g. "Red" for "Color")
    return await prisma.attributeValue.create({
      data: {
        attributeId: id,
        value: data.value,
        colorCode: data.colorCode,
      },
    });
  }

  public async getAllAttributes() {
    return await prisma.attribute.findMany({
      include: {
        values: true, // Show values inside attributes
      },
    });
  }
}

export const attributeServer: AttributeService = new AttributeService();
