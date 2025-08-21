import { notFoundExeption } from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

interface ICommentData {
  text: string;
  rating: number;
  authorId: number;
  productId: number;
}

class CommentService {
  public async createComment(data: ICommentData) {
    const { text, rating, authorId, productId } = data;

    return prisma.comment.create({
      data: {
        text,
        rating,
        productId,
        authorId,
        status: "PENDING",
      },
    });
  }

  public async getCommentsByProductId(productId: number, options: any) {
    const { rating, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const whereClause: any = {
      productId,
      status: "APPROVED",
    };

    if (rating) {
      whereClause.rating = parseInt(rating, 10);
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        author: {
          select: { name: true, lastName: true, avatar: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit, 10),
      skip,
    });

    const totalComments = await prisma.comment.count({
      where: whereClause,
    });

    return {
      comments,
      totalComments,
      totalPage: Math.ceil(totalComments / limit),
    };
  }

  public async getAllComments(options: any) {
    const {
      status,
      rating,
      categoryId,
      productId,
      page = 1,
      limit = 10,
    } = options;
    const skip = (page - 1) * limit;
    const whereClause: any = {};

    if (status) whereClause.status = status;
    if (rating) whereClause.rating = parseInt(rating, 10);
    if (productId) whereClause.productId = productId;

    if (categoryId) {
      whereClause.product = {
        categoryId: categoryId,
      };
    }

    const comments = await prisma.comment.findMany({
      where: whereClause,
      include: {
        author: {
          select: { name: true, email: true },
        },
        product: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: parseInt(limit, 10),
      skip,
    });

    const totalComments = await prisma.comment.count({ where: whereClause });
    return {
      comments,
      totalComments,
      totalPage: Math.ceil(totalComments / limit),
    };
  }

  public async updateCommentStatus(
    commentId: number,
    status: "APPROVED" | "REJECTED"
  ) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });
    if (!comment) {
      throw new notFoundExeption("comment not found");
    }
    return prisma.comment.update({
      where: { id: commentId },
      data: { status },
    });
  }
}

export const commentService: CommentService = new CommentService();
