import { Application } from "express";
import userRoute from "../../features/user/route/user.route";
import authRoute from "../../features/user/route/auth.route";
import categoryRoute from "../../features/category/rote/category.routers";
import productRoute from "../../features/product/route/product.route";
import attributeRoute from "../../features/category/rote/attribute.router";
import orderRouter from "../../features/order/route/order.route";
import wishListRouter from "../../features/wishList/route/wishlist.route";
import addressRouter from "../../features/address/route/address.route";
import cartRoute from "../../features/cart/route/cart.route";
import dashboardRoute from "../../features/dashboard-api/route/dashboard.route";
import couponRoute from "../../features/coupon/route/coupon.route";
import bannerRoute from "../../features/banner/route/banner.route";
import { adminCommentRoute, commentRoute, singleCommentRoute } from "../../features/comment/route/comment.route";

const appRoutes = (app: Application) => {
    // --- Authentication ---
    app.use('/api/v1/auth', authRoute);
    app.use('/api/v1/users', userRoute);

    // --- Catalog ---
    app.use('/api/v1/categories', categoryRoute);
    app.use('/api/v1/attributes', attributeRoute);
    
    productRoute.use("/:productId/comments", commentRoute);
    app.use('/api/v1/products', productRoute);

    // --- Shopping Logic ---
    app.use('/api/v1/addresses', addressRouter);
    app.use('/api/v1/cart', cartRoute);
    app.use('/api/v1/orders', orderRouter); //It includes payment

    // --- Comments Management ---
    app.use('/api/v1/comments', singleCommentRoute);
    // for admin management
    app.use('/api/v1/admin/comments', adminCommentRoute);

    
    app.use('/api/v1/wishlist', wishListRouter);
    app.use('/api/v1/coupons', couponRoute); 
    app.use('/api/v1/banners', bannerRoute);
    app.use('/api/v1/dashboard', dashboardRoute);
}

export default appRoutes;