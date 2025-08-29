import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import {
  verifyUser,
  checkpermission,
} from "../../../globals/middlewares/auth.middleware";
import { dashboardController } from "../controller/dashboard-api.controller";

const dashboardRoute = express.Router();

dashboardRoute.use(verifyUser, checkpermission("Admin", "Shop"));

//+ get key statistics for the admin dashboard
dashboardRoute.get(
  "/stats",
  asyncWrapper(dashboardController.getStats.bind(dashboardController))
);

export default dashboardRoute;
