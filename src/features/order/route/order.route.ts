import express from "express";
import { orderController } from "../controller/order.controller";
import { asyncWrapper } from "../../../globals/middlewares/error.middleware";
import { validateShema } from "../../../globals/middlewares/validate.middleware";
import { createOrderSchema, updateOrderStatusSchema } from "../schema/order.schema";
import { checkpermission, verifyUser } from "../../../globals/middlewares/auth.middleware";

const orderRouter = express.Router();

// 1. Public Callback (ZarinPal calls this)
orderRouter.get(
  "/payment/callback", 
  asyncWrapper(orderController.verifyPaymentCallBack.bind(orderController))
);

// --- Authentication Required ---
orderRouter.use(verifyUser);

// 2. Specific User Routes (MUST be before /:id)
orderRouter.get(
    "/my-orders", 
    asyncWrapper(orderController.getMyOrder.bind(orderController))
);

// 3. Create & Pay
orderRouter.post(
  "/",
  validateShema(createOrderSchema),
  asyncWrapper(orderController.create.bind(orderController))
);

orderRouter.post(
    "/:orderId/pay", 
    asyncWrapper(orderController.initiatePayment.bind(orderController))
);

orderRouter.patch(
    "/:id/cancel", 
    asyncWrapper(orderController.cancel.bind(orderController))
);

// --- Admin Routes (Admin & Shop) ---
orderRouter.use(checkpermission("Admin", "Shop"));

// 4. Specific Admin Routes
orderRouter.get(
    "/all", 
    asyncWrapper(orderController.getAll.bind(orderController))
);

orderRouter.get(
    "/user/:userId", 
    asyncWrapper(orderController.getForUser.bind(orderController))
);

// 5. Dynamic Admin Routes (/:id)
orderRouter.get(
    "/:id", 
    asyncWrapper(orderController.getOne.bind(orderController))
);

orderRouter.patch(
    "/:id/status",
    validateShema(updateOrderStatusSchema),
    asyncWrapper(orderController.updateStatus.bind(orderController))
);

orderRouter.patch(
    "/:id/cancel-admin", 
    asyncWrapper(orderController.cancelByAdmin.bind(orderController))
);

export default orderRouter;