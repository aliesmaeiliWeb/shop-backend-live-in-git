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

  enName?: string;
  warranty?: string;
  amazingExpiresAt?: string | Date;
  specifications?: Record<string, string>; //key value json

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

  enName?: string;
  warranty?: string;
  amazingExpiresAt?: string | Date | null;
  specifications?: Record<string, string>;
}
