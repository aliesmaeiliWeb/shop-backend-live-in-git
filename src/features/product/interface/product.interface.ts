export interface IProductsBody {
  name: string;
  longDescription: string;
  shortDescription: string;
  main_Image: string;
  categoryId: string;
  price: string,
  dynamicAttributes?: string;
};

export interface ICreateSKUBody {
  sku: string;
  price: string;
  quantity: string;
}
