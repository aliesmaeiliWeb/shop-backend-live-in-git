export interface ISkuCreate {
  sku: string;
  price: number;
  quantity: number;
  attributes: Record<string, string>; // => { "Color": "Red", "Size": "XL" }
}

export interface IProductCreate {
  name: string;
  shortDescription?: string;
  longDescription?: string;
  categoryId: string;
  basePrice: number;
  discountPercent?: number;

  //an array of variation
  skus: ISkuCreate[];

  //an array of attributes ids
  attributeValueIds?: string[];
}

export interface IProductUpdate {
  name?: string;
  shortDescription?: string;
  longDescription?: string;
  categoryId?: string;
  basePrice?: number;
  discountPercent?: number;
  isActive?: boolean;
}
