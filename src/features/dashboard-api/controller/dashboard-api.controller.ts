import { Request, Response } from "express";
import { dashboardService } from "../../../services/db/dashboard.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class DashboardController {
    public async getStats(req:Request, res:Response) {
        const stats = await dashboardService.getDashboardState();

        return res.status(HTTP_STATUS.ok).json({
            message: "dashbord stats fetch successfully",
            data: stats
        })
    }
}

export const dashboardController: DashboardController =
  new DashboardController();
