import { Request, Response } from "express";
import { orderService } from "../../../services/db/order.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class OrderController {
  public async create(req:Request, res:Response) {
    const order = await orderService.createOrder(req.body, req.currentUser);

    return res.status(HTTP_STATUS.create).json({
      message: "order create successfully and is pendign payment",
      data: order
    })
  }

  public async cancel(req:Request, res: Response) {
    const orderId = parseInt(req.params.id);
    const updateOrder = await orderService.cancelOrder(orderId, req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "your order has been successfully canceled",
      data: updateOrder
    })
  }
}

export const orderController : OrderController = new OrderController();