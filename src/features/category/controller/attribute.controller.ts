import { Request, Response } from "express";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { attributeServer } from "../../../services/db/attribute.service";

class AttributeController {
  public async createAttribute(req: Request, res: Response) {
    const attr = await attributeServer.createAttribute(req.body);
    res.status(HTTP_STATUS.create).json({ message: "Attribute Created", data: attr });
  }

  public async addAttributeValue(req: Request, res: Response) {
    const id = req.params.id;
    const val = await attributeServer.addValueToAttribute(
      id,
      req.body
    );
    res.status(HTTP_STATUS.create).json({ message: "Value Added", data: val });
  }

  public async getAllAttributes(req: Request, res: Response) {
    const attrs = await attributeServer.getAllAttributes();
    res.status(HTTP_STATUS.ok).json({ data: attrs });
  }
}

export const attributeController: AttributeController =
  new AttributeController();
