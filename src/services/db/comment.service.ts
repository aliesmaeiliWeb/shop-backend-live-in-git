import {
  ICreateComment,
  IUpdateComment,
} from "../../features/comment/interface/comment.interface";
import {
  notFoundExeption,
  unauthorizedExeption,
} from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class CommentService {
  //! add new comment
  public async create(data: ICreateComment) {
    return await prisma.comment.create({
      data: {
        text: data.text,
        rating: data.rating,
        productId: data.productId,
        isApproved: false,
        userId: data.userId,
      },
    });
  }

  //! update comment
  public async update(commentId: string, userId: string, role: string, data: IUpdateComment){
    const comment = await prisma.comment.findUnique({where: {id: commentId}});

    if (!comment) throw new notFoundExeption("کامنتی یافت نشد");
    if (comment.userId !== userId && role !== "Admin") throw new unauthorizedExeption("برای ثبت نظر ابتدا وارد شوید");

    return await prisma.comment.update({
      where: {id: commentId},
      data: {
        text: data.text,
        rating: data.rating,
        isApproved: role === "Admin" ? true : false,
      },
    });
  }

  //! delete comment
  public async delete(commentId: string, userId: string, role: string) {
    const comment = await prisma.comment.findUnique({where: {id: commentId}})
    if (!comment) throw new notFoundExeption("کامنتی یافت نشد");

    if (role !== "Admin" && comment.userId !== userId) {
      throw new unauthorizedExeption("شما دسترسی لازم برای حذف نظر را ندارید");
    }

    await prisma.comment.delete({where: {id: commentId}});
  }

  //! get comment => product
  public async getProductComment(productId: string, query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where = {productId, isApproved: true};

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, lastName: true, avatar: true } } },
      }),
      prisma.comment.count({ where }),
    ]);

    return { comments, total, page, totalPages: Math.ceil(total / limit) };
  };

  //! get all comments
  public async getAllCommentsAdmin(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.isApproved !== undefined) {
      where.isApproved = query.isApproved === "true";
    }

    const [comments, total] = await prisma.$transaction([
      prisma.comment.findMany({
       where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: { 
            user: { select: { name: true, email: true } },
            product: { select: { name: true } }
        },
      }),

      prisma.comment.count({ where }),
    ]);

    return { comments, total, page };
  }
  
  //! accept or reject comment
  public async approveComment (commentId: string, isApproved: boolean) {
    return await prisma.comment.update({
      where: {id:commentId},
      data: {isApproved},
    });
  }
}

export const commentService: CommentService = new CommentService();
