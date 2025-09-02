import express from "express";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import {
  verifyUser,
  checkpermission,
} from "../../../globals/middlewares/auth.middleware";
import { bannerController } from "../controller/banner.controller";
import { bannerUpload, upload } from "../../../globals/helpers/multer";

const bannerRoute = express.Router();

bannerRoute.use(verifyUser, checkpermission("Admin"));

bannerRoute.post(
  "/",
  bannerUpload.single("image"),
  asyncWrapper(bannerController.create.bind(bannerController))
);

bannerRoute.get(
  "/",
  asyncWrapper(bannerController.getAll.bind(bannerController))
);

bannerRoute.delete(
  "/:id",
  asyncWrapper(bannerController.delete.bind(bannerController))
);

export default bannerRoute;
