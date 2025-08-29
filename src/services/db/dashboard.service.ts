import { startOfDay, startOfMonth } from "date-fns";
import { prisma } from "../../prisma";

class DashboardService {
  public async getDashboardState() {
    //+ dates required for filtering
    const today = startOfDay(new Date());
    const monthStart = startOfMonth(new Date());

    //+ execute all queries simultaneously for greate speed
    const [totalRevenue, ordersToday, newCustomers, latestOrders] =
      await Promise.all([
        //+ calculate total revenue only from paid orders
        prisma.order.aggregate({
          _sum: {
            totalPrice: true,
          },
          where: {
            status: "PAID",
          },
        }),

        //+ counting the total number of orders placed today
        prisma.order.count({
          where: {
            createdAt: {
              gte: today,
            },
          },
        }),

        //+ count of new users who have registered since the beginning of this month
        prisma.user.count({
          where: {
            createdAt: {
              gte: monthStart,
            },
          },
        }),

        //+ get the last 5 orders to display on the dashboard
        prisma.order.findMany({
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
          include: {
            autor: {
              select: {
                name: true,
                lastName: true,
              },
            },
          },
        }),
      ]);

    return {
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      ordersToday: ordersToday,
      newCustomersThisMonth: newCustomers,
      latestOrders: latestOrders,
    };
  }
}

export const dashboardService: DashboardService = new DashboardService();
