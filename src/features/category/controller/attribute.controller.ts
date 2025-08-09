import { Request, Response } from "express";
import { attributeServer } from "../../../services/db/attribute.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class AttributeController {
  public async create(req: Request, res: Response) {
    const attribute = await attributeServer.add(req.body);

    res.status(HTTP_STATUS.create).json({
      message: "attribute created",
      data: {
        attribute,
      },
    });
  }

  public async getAll(req: Request, res: Response) {
    const attribute = await attributeServer.read();

    res.status(HTTP_STATUS.ok).json({
      message: "get all attribute",
      data: {
        attribute,
      },
    });
  }
}

export const attributeController: AttributeController =
  new AttributeController();
