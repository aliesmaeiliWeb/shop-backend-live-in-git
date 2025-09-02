import { BannerPosition } from "../../../generated/prisma";

export interface IBannerBody {
  position: BannerPosition;
  title?: string;
  link?: string;
  isActive?: boolean;
}