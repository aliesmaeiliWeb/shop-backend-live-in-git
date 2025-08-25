import { Application } from "express";
import userRoute from "../../features/user/route/user.route";
import authRoute from "../../features/user/route/auth.route";
import categoryRoute from "../../features/category/rote/category.routers";
import productRoute from "../../features/product/route/product.route";
import attributeRoute from "../../features/category/rote/attribute.router";
import { adminCommentRoute, commentRoute } from "../../features/comment/route/comment.route";
import orderRouter from "../../features/order/route/order.route";
import productVariantRoute from "../../features/product-variant/route/product-variant-route";
import productVariantItemRoute from "../../features/product-variant/route/product-variant-item-route";
import wishListRouter from "../../features/wishList/route/wishlist.route";
import addressRouter from "../../features/address/route/address.route";
import cartRoute from "../../features/cart/route/cart.route";

const appRoutes = (app: Application) => {
    app.use('/api/v1/users', userRoute);
    app.use('/api/v1/auth', authRoute);
    app.use('/api/v1/categories', categoryRoute);
    app.use('/api/v1/products', productRoute);
    app.use('/api/v1/attributes', attributeRoute);
    app.use('/api/v1/comments', adminCommentRoute);
    app.use('/api/v1/order', orderRouter);
    app.use('/api/v1/productVariant', productVariantRoute);
    app.use('/api/v1/productVariantItem', productVariantItemRoute);
    app.use('/api/v1/wishlist', wishListRouter);
    app.use('/api/v1/addresses', addressRouter);
    app.use('/api/v1/cart', cartRoute);
}

export default appRoutes;