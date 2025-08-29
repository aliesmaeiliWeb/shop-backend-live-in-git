import {
  ICreateOrder,
  ZarinpalRequestBody,
  ZarinpalRequestResponse,
  ZarinpalVerifyResponse,
} from "../../features/order/interface/order.interface";
import { OrderStatus, Prisma } from "../../generated/prisma";
import {
  BadRequestException,
  notFoundExeption,
  unauthorizedExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";
import axios from "axios";

//+ ZARINPAL DATA:
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;
const ZARINPAL_API_REQUEST = process.env.ZARINPAL_API_REQUEST;
const ZARINPAL_API_VERIFY = process.env.ZARINPAL_API_VERIFY;
const APP_BASE_URL = process.env.APP_BASE_URL || "http://localhost:5000";

class OrderService {
  //+ create order
  public async createOrder(
    requestBody: ICreateOrder,
    currentUser: UserPayload
  ) {
    const { addressId, description } = requestBody;

    return prisma.$transaction(async (tx) => {
      //+ check valid data
      const cart = await tx.cart.findUnique({
        where: { userId: currentUser.id },
        include: {
          cartItem: {
            include: {
              productSKU: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      const address = await tx.address.findUnique({
        where: { id: addressId },
      });

      if (!cart || cart.cartItem.length === 0) {
        throw new BadRequestException("cart empty");
      }

      if (!address || address.userId !== currentUser.id) {
        throw new notFoundExeption("address not found");
      }

      //+ check exist product
      for (const item of cart.cartItem) {
        const productSKU = await tx.productSKU.findUnique({
          where: { id: item.productSKUId },
        });

        if (!productSKU || productSKU.quantity < item.quantity) {
          throw new BadRequestException(
            `insufficient product inventory : ${item.productSKU.product.name}`
          );
        }
      }

      //+ calculate total price
      const subTotal = cart.totalPrice;
      const shippingCost = 0;
      const taxAmount = 0;
      const discountAmount = 0;
      const finalPrice = subTotal + shippingCost + taxAmount + discountAmount;

      //+ save order to pending status
      const order = await tx.order.create({
        data: {
          authorId: currentUser.id,
          totalPrice: finalPrice,
          subtotal: subTotal,
          shippingCost: shippingCost,
          taxAmount: taxAmount,
          discountAmount: discountAmount,
          status: "PENDING",
          shippingAddress: JSON.stringify(address),
          customerName: `${currentUser.name} ${currentUser.lastName}`,
          customerPhone: "User phone number",
          customerEmail: currentUser.email,
          description: description,
        },
      });

      await tx.cartItem.deleteMany({
        where: { cartId: cart.id },
      });

      await tx.cart.update({
        where: {
          id: cart.id,
        },
        data: { totalPrice: 0 },
      });

      return order;
    });
  }

  //+ cancel order
  public async cancelOrder(orderId: number, currentUser: UserPayload) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) {
        throw new notFoundExeption("order not found");
      }

      if (order.authorId !== currentUser.id) {
        throw new unauthorizedExeption(
          "you do not have permission to access this order"
        );
      }

      if (order.status !== "PENDING") {
        throw new BadRequestException(
          "the current status can only be canceled in pending mode"
        );
      }

      const updateOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      return updateOrder;
    });
  }

  //! initiatePayment ==> zarinpal
  public async initiatePayment(orderId: number, currentUser: UserPayload) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, authorId: currentUser.id },
    });

    if (!order) throw new notFoundExeption("order is not found");
    if (order.status !== "PENDING")
      throw new BadRequestException("this order befor canceled or payed");

    const amount = order.totalPrice;
    const description = order.description || `payment number :${order.id}`;
    const callback_url = `${APP_BASE_URL}/api/v1/orders/payment/callback`;

    //+ get request to zarinpal
    const response = await axios.post<ZarinpalRequestResponse>(
      ZARINPAL_API_REQUEST!,
      {
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount,
        description,
        callback_url,
      }
    );

    if (response.data.data.code !== 100) {
      throw new BadRequestException("خطا در برقراری ارتباط با درگاه پرداخت.");
    }

    const authority = response.data.data.authority;

    await prisma.payment.create({
      data: {
        orderId: order.id,
        amount: amount,
        gateway: "ZARINPAL",
        transactionId: authority,
      },
    });

    //+ create final link for users
    const paymentGeteWayUrl = `https://sandbox.zarinpal.com/pg/StartPay/${authority}`;
    return { paymentGeteWayUrl };
  }

  public async verifyPayment(authority: string, status: string) {
    if (status !== "OK") {
      throw new BadRequestException("payment canceled by user");
    }

    const payment = await prisma.payment.findFirst({
      where: { transactionId: authority },
      include: { order: true },
    });

    if (!payment || !payment.order) {
      throw new notFoundExeption("payment information not found");
    }

    const amount = payment.order.totalPrice;

    //+ send request to zarinpal from total price ==> final pay
    const response = await axios.post<ZarinpalVerifyResponse>(
      ZARINPAL_API_VERIFY!,
      {
        merchant_id: ZARINPAL_MERCHANT_ID,
        amount,
        authority,
      }
    );

    const responseData = response.data.data;

    //+ for payment failed
    if (responseData.code !== 100 && responseData.code !== 101) {
      await prisma.payment.update({
        where: { id: payment.id },
        data: { status: "FAILED" },
      });
      throw new BadRequestException(
        `خطا در تایید پرداخت: ${responseData.message}`
      );
    }

    //+ successfully payment
    return prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: "SUCCESSFUL",
          transactionId: responseData.ref_id.toString(),
        },
      });

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: "PAID" },
      });

      const cart = await tx.cart.findUnique({
        where: { userId: payment.order.authorId },
        include: {
          cartItem: {
            include: {
              productSKU: {
                include: {
                  product: true,
                },
              },
            },
          },
        },
      });

      if (cart && cart.cartItem.length > 0) {
        for (const item of cart.cartItem) {
          await tx.orderItems.create({
            data: {
              orderId: payment.orderId,
              productSKUId: item.productSKUId,
              quantity: item.quantity,
              priceAtPurchase: item.price,
              sku: item.productSKU.sku,
            },
          });

          await tx.productSKU.update({
            where: { id: item.productSKUId },
            data: {
              quantity: {
                decrement: item.quantity,
              },
            },
          });
        }
      }
      return {
        status: "SUCCESS",
        message: "payment successfully",
        refId: responseData.ref_id,
      };
    });
  }

  //? update order status
  public async updateOrderStatus(
    orderId: number,
    newStatus: OrderStatus,
    trackingCode?: string
  ) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      throw new notFoundExeption("order is not found");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        trackingCode:
          newStatus === "SHIPPED" ? trackingCode : order.trackingCode,
      },
    });
  }

  //? cancel prodcrt by admin and update product
  public async cancelAndRestockOrder(orderId: number) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new notFoundExeption("order is not found");
      }

      if (order.status === "CANCELLED" || order.status === "REFUNDED") {
        throw new BadRequestException("this order is canceled");
      }

      //+
      for (const item of order.items) {
        await tx.productSKU.update({
          where: { id: item.productSKUId },
          data: {
            quantity: {
              increment: item.quantity,
            },
          },
        });
      }

      const updateOrderStatus = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });

      return updateOrderStatus;
    });
  }

  //? get all order filtered
  public async getAllOrder(options: {
    status?: OrderStatus;
    search?: string;
    page?: number;
    limite?: number;
  }) {
    const { status, search, page = 1, limite = 10 } = options;
    const skip = (page - 1) * limite;

    const whereClause: Prisma.OrderWhereInput = {};

    if (status) {
      if (!Object.values(OrderStatus).includes(status as OrderStatus)) {
        throw new BadRequestException(
          `مقدار وضعیت (status) نامعتبر است. مقادیر مجاز: ${Object.values(
            OrderStatus
          ).join(", ")}`
        );
      }

      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { customerName: { contains: search } },
        { customerEmail: { contains: search } },
      ];
    }

    const order = await prisma.order.findMany({
      where: whereClause,
      include: {
        autor: {
          select: {
            name: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: limite,
      skip,
    });

    const totalOrders = await prisma.order.count({ where: whereClause });
    return { order, totalOrders, totalPage: Math.ceil(totalOrders / limite) };
  }

  //+ get order by id ==> to view full order details , contact the admin
  public async getOrderById(orderId: number) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        autor: { select: { name: true, lastName: true, email: true } },
        items: { include: { productSKU: true } },
        payments: true,
      },
    });

    if (!order) {
      throw new notFoundExeption("order is not found");
    }
    return order;
  }

  //+ new method to get all orders from a specific user
  public async getOrderByUserId(userId: number) {
    return prisma.order.findMany({
      where: { authorId: userId },
      orderBy: { createdAt: "desc" },
    });
  }

  //+ ordering situations with intelligent login
  allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
    PENDING: ["PAID", "CANCELLED"],
    PAID: ["PROCESSING", "CANCELLED"],
    PROCESSING: ["SHIPPED"],
    SHIPPED: ["DELIVERED"],
    DELIVERED: [], // وضعیت نهایی
    CANCELLED: [], // وضعیت نهایی
    REFUNDED: [], // وضعیت نهایی
  };

  public async updateOrder(
    orderId: number,
    newStatus: OrderStatus,
    trackingCode?: string
  ) {
    const order = await this.getOrderById(orderId);

    const currentStatus = order.status;
    const allowedNexStatuses = this.allowedTransitions[currentStatus];

    if (!allowedNexStatuses.includes(newStatus)) {
      throw new BadRequestException("status change is not allowed");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        trackingCode:
          newStatus === "SHIPPED" ? trackingCode : order.trackingCode,
      },
    });
  }

  //+ get the current user's order history
  public async getMyOrder(currentUser: UserPayload) {
    const orders = await prisma.order.findMany({
      where: {
        authorId: currentUser.id,
      },
      include: {
        items: {
          include: {
            productSKU: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!orders)
      throw new BadRequestException(
        `order for user: ${currentUser.name} not found`
      );

    return orders;
  }
}

export const orderService: OrderService = new OrderService();
