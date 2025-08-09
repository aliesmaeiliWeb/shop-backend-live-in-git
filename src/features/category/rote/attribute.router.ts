import express from "express";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { AttributeSchema } from "../schema/attribute.schema";
import { attributeController } from "../controller/attribute.controller";

const attributeRoute = express.Router();
attributeRoute.post(
  "/",
  validateShema(AttributeSchema),
  asyncWrapper(attributeController.create)
);
attributeRoute.get(
  "/",
//   validateShema(AttributeSchema),
  asyncWrapper(attributeController.getAll)
);
export default attributeRoute;
