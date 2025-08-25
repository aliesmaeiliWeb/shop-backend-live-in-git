export interface IUserCreateBody {
  email: string;
  password: string;
  name: string;
  lastName: string;
  avatar: string;
}
export interface IUserUpdateBody {
  name: string;
  lastName: string;
  avatar: string;
}
export interface IUserUpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
