export interface ISkuCreate {
  sku: string;
  price: number;
  quantity: number;
  discountPercent?: number;
  attributes: Record<string, string>; 
}

export interface IProductCreate {
  name: string;
  shortDescription?: string;
  longDescription?: string;
  categoryId: string;
  isAmazing: boolean;
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
  isAmazing: boolean;
  discountPercent?: number;
  isActive?: boolean;
}
