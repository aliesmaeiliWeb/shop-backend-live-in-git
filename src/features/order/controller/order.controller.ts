import { Request, Response } from "express";
import { orderService } from "../../../services/db/order.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { OrderStatus } from "../../../generated/prisma";

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
    const result = await orderService.verifyPayment(
      Authority as string,
      Status as string
    );

    // return res.redirect("به یک صفحه تایید پرداخت هدایت شود کاربر")
    return res.status(HTTP_STATUS.ok).json(result);
  }

  //+ get a list of all orders with filter and search capabilities
  public async getAll(req: Request, res: Response) {
    const result = await orderService.getAllOrder(req.query);
    return res.status(HTTP_STATUS.ok).json({
      message: "get all order list successfully",
      data: result,
    });
  }

  //+ get full details of a specific order
  public async getOne(req:Request, res:Response) {
    const orderId = parseInt(req.params.id);
    const order = await orderService.getOrderById(orderId);

    return res.status(HTTP_STATUS.ok).json({
      message: `get data by id: ${orderId} is successfully`,
      data: order
    })
  }

  //+ receiving all orders from a specific user by the admin
  public async getForUser(req: Request, res:Response) {
    const userId = parseInt(req.params.id);
    const orders = await orderService.getOrderByUserId(userId);

    return res.status(HTTP_STATUS.ok).json({
      message: `get all order for id: ${userId} is successfully`,
      data: orders
    })
  }

  //+ changing the status of an order by admin
  public async updateStatus(req:Request, res:Response) {
    const orderId = parseInt(req.params.id);
    const {status, trackingCode} = req.body;
    const updateOrder = await orderService.updateOrderStatus(orderId, status as OrderStatus, trackingCode);

    return res.status(HTTP_STATUS.ok).json({
      message: "order status updated successfully",
      data: updateOrder,
    })    
  }

  //+canceling a paid order by admin
  public async cancelByAdmin(req:Request, res:Response) {
    const orderId = parseInt(req.params.id);
    const updateOrder = await orderService.cancelAndRestockOrder(orderId);

    return res.status(HTTP_STATUS.ok).json({
      message: "order has been cancelled and items are restocked",
      data: updateOrder
    })
  }
  
  //+ get the order history of the logged-in user
  public async getMyOrder(req:Request, res:Response) {
    const order = await orderService.getMyOrder(req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "user order fetched successfully",
      data: order
    })
  }
}


export const orderController: OrderController = new OrderController();
