import { Request, Response } from "express";
import { orderService } from "../../../services/db/order.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { OrderStatus } from "@prisma/client";

class OrderController {
  //+ check out 
  public async checkout(req: Request, res: Response) {
    const result = await orderService.checkoutAndpay(
      req.currentUser.id.toString(),
      req.body 
    );

    res.status(HTTP_STATUS.ok).json({
      message: result.message,
      data: result, 
    });
  }

  public async verifyPaymentCallBack(req: Request, res: Response) {
    const { Authority, Status } = req.query;

    try {
      const result = await orderService.verifyPayment(
        Authority as string,
        Status as string
      );

      const frontendUrl = `http://localhost:3000/payment/result?status=success&refId=${result.refId}`;
      
      return res.redirect(frontendUrl);

    } catch (error: any) {
      console.error("Payment Verify Error:", error);
      const frontendUrl = `http://localhost:3000/payment/result?status=failed&message=${encodeURIComponent("پرداخت ناموفق بود")}`;
      
      return res.redirect(frontendUrl);
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
