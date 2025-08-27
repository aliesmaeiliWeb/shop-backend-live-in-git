export interface ICommentData {
  text: string;
  rating: number;
  authorId: number;
  productId: number;
}

export interface IUpdateCommentStatus {
  text: string;
  rating: number;
}