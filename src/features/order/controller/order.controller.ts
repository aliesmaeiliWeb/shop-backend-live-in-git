import { NextFunction, Request, Response } from "express";
import { orderService } from "../../../services/db/order.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { BadRequestException } from "../../../globals/middlewares/error.middleware";

class OrderController {
  public async getAll(req: Request, res: Response, next: NextFunction) {
    const result = await orderService.getAllOrders(req.query);
    res.status(HTTP_STATUS.ok).json(result);
  }

  public async getOne(req: Request, res: Response, next: NextFunction) {
    const orderId = parseInt(req.params.id, 10);
    if (isNaN(orderId)) {
      throw new BadRequestException("invalid order id");
    }
    const order = await orderService.getOrderById(
      orderId,
      req.currentUser as any
    );
    res.status(HTTP_STATUS.ok).json(order);
  }

  public async updateStatus(req: Request, res: Response, next: NextFunction) {
    const orderId = parseInt(req.params.id, 10);
    const { status } = req.body;

    if (isNaN(orderId)) {
      throw new BadRequestException("invalid id");
    }

    if (!status) {
      throw new BadRequestException("status is required");
    }

    const updateOrders = await orderService.updateOrders(orderId, status);
    res.status(HTTP_STATUS.ok).json({
      message: "order status updated successfully",
      data: updateOrders,
    });
  }
}

export const orderController: OrderController = new OrderController();
