import { notFoundExeption } from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class OrderService {
  public async getAllOrders(options: any) {
    const { status, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;
    const whereCloase: any = {};

    if (status) {
      if (
        ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"].includes(
          status.toUpperCase()
        )
      ) {
        whereCloase.status = status.toUpperCase();
      }
    }

    const orders = await prisma.order.findMany({
      where: whereCloase,
      include: {
        author: {
          select: { name: true, lastName: true, email: true },
        },
        items: true,
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit, 10),
      skip,
    });
    const totalOrders = await prisma.order.count({
      where: whereCloase,
    });
    return { orders, totalOrders, totalPage: Math.ceil(totalOrders / limit) };
  }

  public async getOrderById(
    orderId: number,
    user: { id: number; role: string }
  ) {
    const order = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
      include: {
        author: { select: { name: true, lastName: true, email: true } },
        items: {
          include: {
            product: { select: { id: true } },
          },
        },
      },
    });

    if (!order) {
      throw new notFoundExeption("order not found");
    }

    if (user.role !== "Admin" && order.authorId !== user.id) {
      throw new notFoundExeption("you are not authorized to view this order");
    }

    return order;
  }

  public async updateOrders(
    orderId: number,
    status: "PAID" | "SHIPPED" | "DELIVERED" | "CANCELLED"
  ) {
    const orderExists = await prisma.order.findUnique({
      where: {
        id: orderId,
      },
    });

    if (!orderExists) {
      throw new notFoundExeption("order not found");
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status },
    });
  }
}

export const orderService: OrderService = new OrderService();