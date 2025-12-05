export interface IAuthRequestOtp {
  phoneNumber: string;
}

export interface IAuthVerifyOtp {
  phoneNumber: string;
  otpCode: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: any;
}