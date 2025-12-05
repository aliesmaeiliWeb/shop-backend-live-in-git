import { Request, Response } from "express";
import { addressService } from "../../../services/db/address.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class AddressController {
  public async addAddress(req: Request, res: Response) {
    const address = await addressService.add(req.body, req.currentUser.id.toString());

    return res.status(HTTP_STATUS.create).json({
      message: "آدرس باموقیت اضافه شد",
      data: address,
    });
  }

  public async getMyAddresses(req: Request, res: Response) {
    const addresses = await addressService.getAll(req.currentUser.id.toString());
    
    res.status(HTTP_STATUS.ok).json({
      data: addresses,
    });
  }

  public async updateAddress(req: Request, res: Response) {
    const updateAddress = await addressService.update(
      req.params.id,
      req.body,
      req.currentUser.id.toString(),
    );

    return res.status(HTTP_STATUS.ok).json({
      message: "آدرس با موفقیت آپدیت شد",
      data: {
        updateAddress,
      },
    });
  }

  public async deleteAddress(req: Request, res: Response) {
    await addressService.remove(req.params.id, req.currentUser.id.toString());

    return res.status(HTTP_STATUS.ok).json({
      message: "آدرس با موفقیت حذف شد",
    });
  }
}

export const addressController: AddressController = new AddressController();
