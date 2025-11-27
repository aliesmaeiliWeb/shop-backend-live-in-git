import { Request, Response } from "express";
import { orderService } from "../../../services/db/order.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { OrderStatus } from "../../../generated/prisma";
import { unauthorizedExeption } from "../../../globals/middlewares/error.middleware";

class OrderController {
  //+ create order
  public async create(req: Request, res: Response) {
    const order = await orderService.createOrder(
      req.currentUser.id.toString(),
      req.body
    );

    res.status(HTTP_STATUS.create).json({
      message: "سبد خرید با موفقیت ساخته شد",
      data: order,
    });
  }

  public async initiatePayment(req: Request, res: Response) {
    const result = await orderService.initiatePayment(
      req.params.orderId,
      req.currentUser.id.toString()
    );
    res.status(HTTP_STATUS.ok).json(result);
  }

  public async verifyPaymentCallBack(req: Request, res: Response) {
    const { Authority, Status } = req.query;

    try {
      const result = await orderService.verifyPayment(
        Authority as string,
        Status as string
      );

      res.status(HTTP_STATUS.ok).json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "خطا" });
    }
  }

  public async cancel(req: Request, res: Response) {
    const result = await orderService.cancelOrder(
      req.params.id,
      req.currentUser.id.toString()
    );
    res.status(HTTP_STATUS.ok).json({
      message: "سفارش با موفقیت لغو شد",
      data: result,
    });
  }

  public async getMyOrder(req: Request, res: Response) {
    const orders = await orderService.getMyOrders(
      req.currentUser.id.toString()
    );
    res.status(HTTP_STATUS.ok).json({ data: orders });
  }

  //! admin methodes

  public async getAll(req: Request, res: Response) {
    const orders = await orderService.getAllOrders(req.query);
    res.status(HTTP_STATUS.ok).json({ data: orders });
  }

  public async getOne(req: Request, res: Response) {
    const order = await orderService.getOrderById(req.params.id);
    res.status(HTTP_STATUS.ok).json({ data: order });
  }

  public async getForUser(req: Request, res: Response) {
    const orders = await orderService.getOrderByUserId(req.params.userId);
    res.status(HTTP_STATUS.ok).json({ data: orders });
  }

  public async updateStatus(req: Request, res: Response) {
    const { status, trackingCode } = req.body;
    const order = await orderService.updateOrderStatus(
      req.params.id,
      status as OrderStatus,
      trackingCode
    );

    res.status(HTTP_STATUS.ok).json({
      message: "Order status updated",
      data: order
    });
  }

  public async cancelByAdmin(req:Request, res:Response) {
    const order = await orderService.adminCancelOrder(req.params.id);
    res.status(HTTP_STATUS.ok).json({
      message: "سفارش به وسیله ادمین لغو شد",
      data: order,
    });
  }
}

export const orderController: OrderController = new OrderController();
