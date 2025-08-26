import { Role } from "../../../generated/prisma";

export interface IUserCreateBody {
  email: string;
  password: string;
  name: string;
  lastName: string;
  avatar: string;
  role: Role;
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
