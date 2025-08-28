import { Request, Response } from "express";
import { orderService } from "../../../services/db/order.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class OrderController {
  //+ create order
  public async create(req: Request, res: Response) {
    const order = await orderService.createOrder(req.body, req.currentUser);

    return res.status(HTTP_STATUS.create).json({
      message: "order create successfully and is pendign payment",
      data: order,
    });
  }

  //+ cancel order
  public async cancel(req: Request, res: Response) {
    const orderId = parseInt(req.params.id);
    const updateOrder = await orderService.cancelOrder(
      orderId,
      req.currentUser
    );

    return res.status(HTTP_STATUS.ok).json({
      message: "your order has been successfully canceled",
      data: updateOrder,
    });
  }

  //+ pyment order
  public async initiatePayment(req: Request, res: Response) {
    const orderId = parseInt(req.params.orderId);
    const result = await orderService.initiatePayment(orderId, req.currentUser);

    return res.status(HTTP_STATUS.ok).json(result);
  }

  //+ finaly pyment zarinpal
  public async verifyPaymentCallBack(req: Request, res: Response) {
    const { Authority, Status } = req.query;
     const result = await orderService.verifyPayment(Authority as string, Status as string);

    // return res.redirect("به یک صفحه تایید پرداخت هدایت شود کاربر")
    return res.status(HTTP_STATUS.ok).json(result);
  }
}

export const orderController: OrderController = new OrderController();
