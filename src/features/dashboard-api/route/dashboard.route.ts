import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { checkpermission, verifyUser } from "../../../globals/middlewares/auth.middleware";
import { dashboardController } from "../controller/dashboard-api.controller";

const dashboardRoute = express.Router();

dashboardRoute.use(verifyUser);
dashboardRoute.use(checkpermission("ADMIN"));

dashboardRoute.get(
  "/cards",
  asyncWrapper(dashboardController.getCards.bind(dashboardController))
);

dashboardRoute.get(
  "/chart",
  asyncWrapper(dashboardController.getChart.bind(dashboardController))
);

dashboardRoute.get(
  "/recent-orders",
  asyncWrapper(dashboardController.getRecents.bind(dashboardController))
);

export default dashboardRoute;