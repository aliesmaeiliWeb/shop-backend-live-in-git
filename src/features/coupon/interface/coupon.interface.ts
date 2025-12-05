export interface ICreateCoupon {
  code: string;          
  percent: number;       
  maxDiscount?: number;  
  usageLimit: number;    
  expiresAt: string;     
}

export interface IUpdateCoupon {
  code?: string;
  percent?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt?: string;
  isActive?: boolean;
}