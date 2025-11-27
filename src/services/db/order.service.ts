import axios from "axios";
import {
  BadRequestException,
  notFoundExeption,
  unauthorizedExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";
import { couponService } from "./coupon.service";
import {
  ZarinpalRequestResponse,
  ZarinpalVerifyResponse,
} from "../../features/order/interface/order.interface";
import { OrderStatus } from "../../generated/prisma";

//+ ZARINPAL DATA:
const ZARINPAL_MERCHANT_ID = process.env.ZARINPAL_MERCHANT_ID;
const ZARINPAL_API_REQUEST = process.env.ZARINPAL_API_REQUEST;
const ZARINPAL_API_VERIFY = process.env.ZARINPAL_API_VERIFY;

class OrderService {
  private generateOrderNumber() {
    return `ORD-${Date.now().toString().slice(-6)}-${Math.floor(
      Math.random() * 100
    )}`;
  }

  //? helper logic
  private async performCancelLogic(orderId: string, items: any[]) {
    return await prisma.$transaction(async (tx) => {
      //? Restock items
      for (const item of items) {
        if (item.productSKUId) {
          await tx.productSKU.update({
            where: { id: item.productSKUId },
            data: { quantity: { increment: item.quantity } },
          });
        }
      }
      //? Update Status
      return await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
      });
    });
  }

  //! create order pending
  public async createOrder(
    userId: string,
    data: { addressId: string; note?: string; couponCode?: string }
  ) {
    const { addressId, note, couponCode } = data;

    //? check address
    const address = await prisma.address.findUnique({
      where: { id: addressId },
    });
    if (!address || address.userId !== userId)
      throw new notFoundExeption("آدرسی پیدا نشد");

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new notFoundExeption("کاربر یافت نشد");

    //? get cart with details
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: {
        items: { include: { productSKU: { include: { product: true } } } },
      },
    });

    if (!cart || cart.items.length === 0)
      throw new BadRequestException("سبد خرید خالی است");

    //? calculate price
    const totalPrice = cart.totalPrice;
    const shippingCost = 50000;
    let discountAmount = 0;

    if (couponCode) {
      discountAmount = await couponService.validateCoupon(
        couponCode,
        totalPrice
      );
    }

    const finalPrice = totalPrice + shippingCost - discountAmount;

    //? transaction
    return await prisma.$transaction(async (tx) => {
      //? check stock logic
      for (const item of cart.items) {
        const currentSku = await tx.productSKU.findUnique({
          where: { id: item.productSKUId },
        });
        if (!currentSku || currentSku.quantity < item.quantity) {
          throw new BadRequestException("موجودی این محصول کافی نمیباشد");
        }

        await tx.productSKU.update({
          where: { id: item.productSKUId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      //? create order
      const order = await tx.order.create({
        data: {
          orderNumber: this.generateOrderNumber(),
          userId,
          addressJson: JSON.stringify(address),
          receiverName:
            `${user.name || ""} ${user.lastName || ""}`.trim() || "Unknown",
          receiverPhone: user.phoneNumber,
          note: note,
          totalPrice,
          shippingCost,
          discountAmount,
          finalPrice,
          couponCode,
          status: "PENDING",
        },
      });

      const orderItemData = cart.items.map((item) => {
        const originalPrice = item.productSKU.price;
        const discountPercent = item.productSKU.product.discountPercent || 0;

        const finalItemPrice =
          originalPrice - (originalPrice * discountPercent) / 100;

        return {
          orderId: order.id,
          productSKUId: item.productSKUId,
          productName: item.productSKU.product.name,
          skuCode: item.productSKU.sku,
          quantity: item.quantity,
          price: finalItemPrice,
          image: item.productSKU.product.mainImage,
        };
      });

      //? create order itmems
      await tx.orderItem.createMany({data : orderItemData});

      //? update coupon usage
      if (couponCode) {
        await tx.coupon.update({
          where: { code: couponCode },
          data: { usedCount: { increment: 1 } },
        });
      }

      //? clear cart
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      await tx.cart.update({ where: { id: cart.id }, data: { totalPrice: 0 } });

      return order;
    });
  }

  //! initiatePayment
  public async initiatePayment(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });

    if (!order) throw new notFoundExeption("سفارش یافت نشد");
    if (order.userId !== userId)
      throw new unauthorizedExeption("برای دسترسی به این بخش لطفا وارد بشوید");
    if (order.status !== "PENDING")
      throw new BadRequestException("سفارش شما معلق نیست");

    try {
      const response = await axios.post<ZarinpalRequestResponse>(
        `${ZARINPAL_API_REQUEST}/request.json`,
        {
          merchant_id: ZARINPAL_MERCHANT_ID,
          amount: order.finalPrice * 10, // Toman to Rial
          description: `Order Payment #${order.orderNumber}`,
          callback_url: `/calback_zarinpall`,
        }
      );

      const { data } = response.data;

      if (data && data.code === 100) {
        //? save payment record
        await prisma.payment.create({
          data: {
            orderId: order.id,
            amount: order.finalPrice,
            gateway: "ZARINPAL",
            //? save authority
            resNumber: data.authority,
            status: false,
          },
        });

        return {
          url: `https://sandbox.zarinpal.com/pg/StartPay/${data.authority}`,
        };
      } else {
        throw new BadRequestException("خطا در پنل زرین پال");
      }
    } catch (error) {
      throw new BadRequestException("خطا در اتصال برای پرداخت");
    }
  }

  //! verify payment
  public async verifyPayment(authority: string, status: string) {
    if (status !== "ok")
      throw new BadRequestException("پرداخت توسط کاربر لغو شد");

    const payment = await prisma.payment.findFirst({
      where: { resNumber: authority },
    });
    if (!payment) throw new notFoundExeption("تراکنش پرداخت یافت نشد");

    const order = await prisma.order.findUnique({
      where: { id: payment.orderId },
    });
    if (!order) throw new notFoundExeption("پرداختی یافت نشد");

    try {
      const response = await axios.post<ZarinpalVerifyResponse>(
        `${ZARINPAL_API_VERIFY}/verify.json`,
        {
          merchant_id: ZARINPAL_MERCHANT_ID,
          amount: order.finalPrice * 10,
          authority,
        }
      );

      const { data } = response.data;

      if (data && data.code === 100) {
        //? success: update payment and order status
        await prisma.$transaction([
          prisma.payment.update({
            where: { id: payment.id },
            data: { status: true, refId: data.ref_id.toString() },
          }),
          prisma.order.update({
            where: { id: order.id },
            data: { status: "PAID" },
          }),
        ]);

        return { success: true, refId: data.ref_id };
      } else {
        throw new BadRequestException("راستی آزمایی پرداخت موفقیت آمیز نبود");
      }
    } catch (error) {
      throw new BadRequestException("اتصال برای تایید موفقیت آمیز نبود");
    }
  }

  //! Cancel Order
  public async cancelOrder(orderId: string, userId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) throw new notFoundExeption("Order not found");
    if (order.userId !== userId)
      throw new unauthorizedExeption("Access denied");
    if (order.status !== "PENDING")
      throw new BadRequestException("Only pending orders can be cancelled");

    return await this.performCancelLogic(orderId, order.items);
  }

  //! get my order
  public async getMyOrders(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true }, //? Show items summary
    });
  }

  //! get all orders
  public async getAllOrders(query: any) {
    const whereClause: any = {};
    if (query.status) whereClause.status = query.status;
    if (query.search) {
      whereClause.OR = [
        { orderNumber: { contains: query.search } },
        { receiverName: { contains: query.search } },
      ];
    }

    return await prisma.order.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { phoneNumber: true, name: true, lastName: true } },
      },
    });
  }

  //! get product by id
  public async getOrderById(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: { select: { name: true, lastName: true, phoneNumber: true } },
        payment: true,
      },
    });

    if (!order) throw new notFoundExeption("سب سفارش شما خالی است");
    return order;
  }

  //! get order by user id => see user order
  public async getOrderByUserId(userId: string) {
    return await prisma.order.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { items: true },
    });
  }

  //! admin cancel order
  public async adminCancelOrder(orderId: string) {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) throw new notFoundExeption("سبد خرید یافت نشد");

    return await this.performCancelLogic(orderId, order.items);
  }

  //! update order status
  public async updateOrderStatus(
    orderId: string,
    status: OrderStatus,
    trackingCode?: string
  ) {
    return await prisma.order.update({
      where: { id: orderId },
      data: {
        status,
        note: trackingCode ? `Tracking Code: ${trackingCode}` : undefined,
      },
    });
  }
}

export const orderService: OrderService = new OrderService();
