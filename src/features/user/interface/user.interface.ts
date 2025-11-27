import { Role } from "../../../generated/prisma";

export interface IUserCreateBody {
  phoneNumber: string;
  name?: string;
  lastName?: string;
  email?: string;
  role: Role;
  isActive: boolean;
}
export interface IUserUpdateProfile {
  name?: string;
  lastName?: string;
  email?: string;
}
export interface IUserUpdateAdmin {
 name?: string;
 lastName?: string;
 email?: string;
 role?: Role;
 isActive?: boolean
}
