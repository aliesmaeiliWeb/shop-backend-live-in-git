import { Role } from "../../../generated/prisma";

export interface IUserCreateBody {
  email: string;
  password: string;
  name: string;
  lastName: string;
  avatar: string;
  role: Role;
  phoneNumber?: string;
  isActive: boolean
}
export interface IUserUpdateBody {
  name: string;
  lastName: string;
  avatar: string;
  phoneNumber?: string;
  isActive: boolean
}
export interface IUserUpdatePasswordBody {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}
