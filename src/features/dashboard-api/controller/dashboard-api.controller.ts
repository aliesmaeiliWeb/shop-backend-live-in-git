import { Request, Response } from "express";
import { dashboardService } from "../../../services/db/dashboard.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class DashboardController {
  public async getCards(req: Request, res: Response) {
    const data = await dashboardService.getStatsCards();
    res.status(HTTP_STATUS.ok).json({ data });
  }

  public async getChart(req: Request, res: Response) {
    const data = await dashboardService.getSalesChart();
    res.status(HTTP_STATUS.ok).json({ data });
  }

  public async getRecents(req: Request, res: Response) {
    const data = await dashboardService.getRecentOrders();
    res.status(HTTP_STATUS.ok).json({ data });
  }
}

export const dashboardController: DashboardController =
  new DashboardController();
