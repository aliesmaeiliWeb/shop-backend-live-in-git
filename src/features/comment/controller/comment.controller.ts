import { Request, Response } from "express";
import { commentService } from "../../../services/db/comment.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class CommentController {
  public async create(req: Request, res: Response) {
    const comment = await commentService.create({
      text: req.body.text,
      rating: req.body.rating,
      userId: req.currentUser.id.toString(),
      productId: req.params.productId, 
    });
    res
      .status(HTTP_STATUS.create)
      .json({ message: "Comment submitted", data: comment });
  }

  public async update(req: Request, res: Response) {
    const comment = await commentService.update(
      req.params.commentId,
      req.currentUser.id.toString(),
      req.currentUser.role,
      req.body
    );
    res
      .status(HTTP_STATUS.ok)
      .json({ message: "Comment updated", data: comment });
  }

  public async delete(req: Request, res: Response) {
    await commentService.delete(
      req.params.commentId,
      req.currentUser.id.toString(),
      req.currentUser.role
    );
    res.status(HTTP_STATUS.ok).json({ message: "Comment deleted" });
  }

  public async getForProduct(req: Request, res: Response) {
    const result = await commentService.getProductComment(
      req.params.productId,
      req.query
    );
    res.status(HTTP_STATUS.ok).json(result);
  }

  //? --- Admin Methods ---

  public async getAllAdmin(req: Request, res: Response) {
    const result = await commentService.getAllCommentsAdmin(req.query);
    res.status(HTTP_STATUS.ok).json(result);
  }

  public async updateStatus(req: Request, res: Response) {
    const { isApproved } = req.body;
    const comment = await commentService.approveComment(
      req.params.commentId,
      isApproved
    );
    res
      .status(HTTP_STATUS.ok)
      .json({ message: "Status updated", data: comment });
  }
}

export const commentController: CommentController = new CommentController();
