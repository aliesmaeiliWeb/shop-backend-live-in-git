import { ICreateOrder } from "../../features/order/interface/order.interface";
import {
  BadRequestException,
  notFoundExeption,
  unauthorizedExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class OrderService {
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
}

export const orderService: OrderService = new OrderService();
