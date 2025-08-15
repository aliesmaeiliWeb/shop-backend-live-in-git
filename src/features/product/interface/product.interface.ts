export interface IProductsBody {
  name: string;
  longDescription: string;
  shortDescription: string;
  quantity: string;
  main_Image: string;
  categoryId: string;
  price: string,
  dynamicAttributes?: string;
};
