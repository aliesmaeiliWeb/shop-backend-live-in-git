import { Application } from "express";
import userRoute from "../../features/user/route/user.route";
import authRoute from "../../features/user/route/auth.route";
import categoryRoute from "../../features/category/rote/category.routers";
import productRoute from "../../features/product/route/product.route";
import attributeRoute from "../../features/category/rote/attribute.router";
import { adminCommentRoute, commentRoute } from "../../features/comment/route/comment.route";

const appRoutes = (app: Application) => {
    app.use('/api/v1/users', userRoute);
    app.use('/api/v1/auth', authRoute);
    app.use('/api/v1/categories', categoryRoute);
    app.use('/api/v1/products', productRoute);
    app.use('/api/v1/attributes', attributeRoute);
    app.use('/api/v1/comments', adminCommentRoute);
}

export default appRoutes;