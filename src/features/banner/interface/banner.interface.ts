import { BannerPosition } from "@prisma/client";

export interface ICreateBanner {
  title?: string;
  link?: string;
  isActive?: boolean;
  position: BannerPosition;
}

export interface IUpdateBanner {
  title?: string;
  link?: string;
  isActive?: boolean;
  position?: BannerPosition;
}
