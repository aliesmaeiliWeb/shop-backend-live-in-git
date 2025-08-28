export interface ICreateOrder {
  addressId: number;
  description: string;
  couponCode?: string;
}

export interface ZarinpalRequestBody {
  code: number;
  message: string;
  authority: string;
  fee_type: string;
  fee: number;
}

export interface ZarinpalRequestResponse {
  data: ZarinpalRequestBody;
  error: any;
}

interface ZarinpalVerifyData {
  code: number;
  message: string;
  ref_id: number;
  card_pan: string;
  card_hash: string;
  fee_type: string;
  fee: number;
}

export interface ZarinpalVerifyResponse {
  data: ZarinpalVerifyData;
  errors: any[];
}
