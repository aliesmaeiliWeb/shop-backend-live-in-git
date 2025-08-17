import { NextFunction, Request, Response } from "express";
import { commentService } from "../../../services/db/comment.service";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { BadRequestException } from "../../../globals/middlewares/error.middleware";

class CommentController {
  public async create(req: Request, res: Response, next: NextFunction) {
    const productId = Number(req.params.productId);
    const { text, rating } = req.body;
    const authorId = req.currentUser!.id;

    const comment = await commentService.createComment({
      text,
      rating,
      authorId,
      productId,
    });
    res.status(HTTP_STATUS.create).json({
      message: "comment submitted and is successfully",
      data: {
        comment,
      },
    });
  }

  public async getForProduct(req: Request, res: Response, next: NextFunction) {
    const productId = Number(req.params.productId);
    const result = await commentService.getCommentsByProductId(
      productId,
      req.query
    );

    res.status(HTTP_STATUS.ok).json({
      result,
    });
  }

  public async getAll(req: Request, res: Response, next: NextFunction) {
    const result = await commentService.getAllComments(req.query);
    res.status(HTTP_STATUS.ok).json(result);
  }

  public async updateStatus(req: Request, res: Response, next: NextFunction) {
    const { commentId: commentIDParam } = req.params;
    const commentId = parseInt(commentIDParam, 10);

    if (isNaN(commentId)) {
      throw new BadRequestException("Comment ID must be a valid number.");
    }

    const { status } = req.body;
    const updatedComment = await commentService.updateCommentStatus(
      commentId,
      status
    );
    res
      .status(HTTP_STATUS.ok)
      .json({
        message: "Comment status updated successfully.",
        data: updatedComment,
      });
  }
}

export const commentController: CommentController = new CommentController();
