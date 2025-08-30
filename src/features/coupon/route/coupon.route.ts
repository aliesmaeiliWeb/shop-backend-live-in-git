import express from 'express';
import { checkpermission, verifyUser } from '../../../globals/middlewares/auth.middleware';
import { asyncWrapper } from '../../../globals/middlewares/error.middleware';
import { couponController } from '../controller/coupon.controller';

const couponRoute = express.Router();

couponRoute.use(verifyUser, checkpermission("Admin", "Shop"));

//+ create a new coupon
couponRoute.post(
    '/',
    asyncWrapper(couponController.create.bind(couponController))
);

//+ get all coupon
couponRoute.get(
    "/",
    asyncWrapper(couponController.getAll.bind(couponController))
);

//+ get one coupon
couponRoute.get(
    "/:id",
    asyncWrapper(couponController.getOne.bind(couponController))
);

//+ update coupon
couponRoute.patch(
    '/:id',
    asyncWrapper(couponController.update.bind(couponController))
);

//+ remove coupon
couponRoute.delete(
    '/:id',
    asyncWrapper(couponController.delete.bind(couponController))
)

export default couponRoute;