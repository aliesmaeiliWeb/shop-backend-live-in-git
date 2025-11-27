import express from "express";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { checkpermission, verifyUser } from "../../../globals/middlewares/auth.middleware";
import { attributeController } from "../controller/attribute.controller";
import { AttributeCreateSchema, AttributeValueSchema } from "../schema/attribute.schema";

const attributeRoute = express.Router();

// Public
attributeRoute.get("/", asyncWrapper(attributeController.getAllAttributes.bind(attributeController)));

// Admin Only
attributeRoute.use(verifyUser);
attributeRoute.use(checkpermission("ADMIN"));

attributeRoute.post(
  "/",
  validateShema(AttributeCreateSchema),
  asyncWrapper(attributeController.createAttribute.bind(attributeController))
);

attributeRoute.post(
  "/:id/value",
  validateShema(AttributeValueSchema),
  asyncWrapper(attributeController.addAttributeValue.bind(attributeController))
);

export default attributeRoute;