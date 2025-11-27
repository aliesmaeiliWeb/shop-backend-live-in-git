export interface ICreateComment{
  text: string;
  rating: number;
  productId: string;
  userId: string
}

export interface IUpdateComment {
  text: string;
  rating: number;
}