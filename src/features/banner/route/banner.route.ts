import express from "express";
import { bannerController } from "../controller/banner.controller";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import {
  createBannerSchema,
  updateBannerSchema,
} from "../schema/banner.schema";
import {
  checkpermission,
  verifyUser,
} from "../../../globals/middlewares/auth.middleware";
import { bannerUpload } from "../../../globals/helpers/multer";

const bannerRoute = express.Router();

bannerRoute.get(
  "/",
  asyncWrapper(bannerController.getAllPublic.bind(bannerController))
);

bannerRoute.use(verifyUser);
bannerRoute.use(checkpermission("Admin", "Shop_Manager"));

bannerRoute.get(
  "/admin/all",
  asyncWrapper(bannerController.getAllAdmin.bind(bannerController))
);

bannerRoute.post(
  "/",
  bannerUpload.single("image"),
  validateShema(createBannerSchema),
  asyncWrapper(bannerController.create.bind(bannerController))
);

bannerRoute.patch(
  "/:id",
  validateShema(updateBannerSchema),
  asyncWrapper(bannerController.update.bind(bannerController))
);

bannerRoute.delete(
  "/:id",
  asyncWrapper(bannerController.delete.bind(bannerController))
);

export default bannerRoute;
