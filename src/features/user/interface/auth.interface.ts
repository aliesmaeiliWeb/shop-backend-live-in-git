export interface IAuthRegister {
  email: string;
  password: string;
  name: string;
  lastName: string;
  avatar: string;
}

export interface IAuthLogin {
  email: string;
  password: string;
}
