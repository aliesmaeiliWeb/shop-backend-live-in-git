import { Application } from "express";
import userRoute from "../../features/user/route/user.route";
import authRoute from "../../features/user/route/auth.route";
import categoryRoute from "../../features/category/rote/category.routers";
import productRoute from "../../features/product/route/product.route";
import attributeRoute from "../../features/category/rote/attribute.router";
import { adminCommentRoute, commentRoute } from "../../features/comment/route/comment.route";
import orderRouter from "../../features/order/route/order.route";
import wishListRouter from "../../features/wishList/route/wishlist.route";
import addressRouter from "../../features/address/route/address.route";
import cartRoute from "../../features/cart/route/cart.route";
import dashboardRoute from "../../features/dashboard-api/route/dashboard.route";
import couponRoute from "../../features/coupon/route/coupon.route";
import bannerRoute from "../../features/banner/route/banner.route";

const appRoutes = (app: Application) => {
    app.use('/api/v1/users', userRoute);
    app.use('/api/v1/auth', authRoute);
    app.use('/api/v1/categories', categoryRoute);
    app.use('/api/v1/products', productRoute);
    app.use('/api/v1/attributes', attributeRoute);
    app.use('/api/v1/comments', adminCommentRoute);
    app.use('/api/v1/orders', orderRouter);
    app.use('/api/v1/wishlist', wishListRouter);
    app.use('/api/v1/addresses', addressRouter);
    app.use('/api/v1/cart', cartRoute);
    app.use('/api/v1/dashboard', dashboardRoute);
    app.use('/api/v1/coupon', couponRoute);
    app.use('/api/v1/banner', bannerRoute);
}

export default appRoutes;