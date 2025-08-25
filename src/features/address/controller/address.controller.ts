import { Request, Response } from "express";
import { addressService } from "../../../services/db/address.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class AddressController {
  public async addAddress(req: Request, res: Response) {
    const address = await addressService.add(req.body, req.currentUser);

    return res.status(HTTP_STATUS.create).json({
      message: "add address successfully",
      data: address,
    });
  }

  public async updateAddress(req: Request, res: Response) {
    const updateAddress = await addressService.update(
      parseInt(req.params.id),
      req.body,
      req.currentUser
    );

    return res.status(HTTP_STATUS.ok).json({
      message: "update address successfully",
      data: {
        updateAddress,
      },
    });
  }

  public async delete(req: Request, res: Response) {
    await addressService.remove(parseInt(req.params.id), req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "delete address successfully",
    });
  }

  public async getMyAddress(req: Request, res: Response) {
    const address = await addressService.get(req.currentUser);

    res.status(HTTP_STATUS.ok).json({
      message: "addresses feched successfully",
      data: {
        address,
      },
    });
  }
}

export const addressController: AddressController = new AddressController();
