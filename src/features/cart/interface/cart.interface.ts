export interface ICreateAdd {
  skuId: string;
  quantity: number;
}

export interface ICartUpdateQty {
  quantity: number;
}

export interface ICartSynceItem {
  skuId: string;
  quantity: number;
}

export interface ICartSynce {
  items: ICartSynceItem[];
}
