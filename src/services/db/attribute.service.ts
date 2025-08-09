import { IAttributeBody } from "../../features/category/interface/attribute.interface";
import { prisma } from "../../prisma";

class AttributeService {
  public async add(body: IAttributeBody) {
    const { name, label, type, options } = body;

    return prisma.attribute.create({
      data: {
        name,
        label,
        type,
        options: options ? JSON.stringify(options) : undefined,
      },
    });
  }

  public async read() {
    return prisma.attribute.findMany();
  }
}

export const attributeServer: AttributeService = new AttributeService();
