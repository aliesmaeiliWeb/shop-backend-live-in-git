import { prisma } from "../../prisma";

class DashboardService {
  public async getStatsCards() {
    const now = new Date();
    const startOfTody = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDay()
    );
    const startOfWeek = new Date(now.getTime() - 7 * 20 * 60 * 60 * 1000);

    const revenue = await prisma.order.aggregate({
      where: { status: "PAID" },
      _sum: { finalPrice: true },
    });

    const todayOrders = await prisma.order.count({
      where: { createdAt: { gte: startOfTody } },
    });

    const totalUsers = await prisma.user.count({
      where: { role: "USER" },
    });

    const weeklyOrders = await prisma.order.count({
      where: {
        status: "PAID",
        createdAt: { gte: startOfWeek },
      },
    });

    return {
      totalRevenue: revenue._sum.finalPrice || 0,
      todayOrders,
      totalUsers,
      weeklyOrders,
    };
  }

  public async getSalesChart() {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);

    const orders = await prisma.order.findMany({
      where: {
        status: "PAID",
        createdAt: { gte: startOfYear },
      },
      select: {
        createdAt: true,
        finalPrice: true,
      },
      orderBy: { createdAt: "asc" },
    });

    const weeklyData: Record<
      number,
      { week: number; income: number; count: number }
    > = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt);
      const start = new Date(date.getFullYear(), 0, 1);
      const days = Math.floor(
        (date.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
      );
      const weekNumber = Math.ceil((days + 1) / 7);

      if (!weeklyData[weekNumber]) {
        weeklyData[weekNumber] = { week: weekNumber, income: 0, count: 0 };
      }

      weeklyData[weekNumber].income += order.finalPrice;
      weeklyData[weekNumber].count += 1;
    });

    return Object.values(weeklyData);
  }

  public async getRecentOrders() {
    return await prisma.order.findMany({
      take: 20,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        finalPrice: true,
        createdAt: true,

        user: {
          select: {
            name: true,
            lastName: true,
            phoneNumber: true,
            avatar: true,
          },
        },

        items: {
          take: 1,
          select: {
            productName: true,
            image: true,
          },
        },
      },
    });
  }
}

export const dashboardService: DashboardService = new DashboardService();
