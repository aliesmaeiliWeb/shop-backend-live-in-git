export interface ICreateOrder {
  addressId: string;
  note?: string;
  couponCode?: string;
}

export interface ZarinpalRequestResponse {
  data: {
    code: number;
    message: string;
    authority: string;
    fee_type: string;
    fee: number;
  };
  errors: any;
}

export interface ZarinpalVerifyResponse {
  data: {
    code: number;
    message: string;
    ref_id: number;
    card_pan: string;
    card_hash: string;
    fee_type: string;
    fee: number;
  };
  errors: any;
}
