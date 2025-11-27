import { IUserCreateBody, IUserUpdateAdmin, IUserUpdateProfile } from "../../features/user/interface/user.interface";
import { Prisma } from "../../generated/prisma";
import { BadRequestException, notFoundExeption } from "../../globals/middlewares/error.middleware";
import { prisma } from "../../prisma";

class UserService {
  //! Admin creates a user manually
  public async create(data: IUserCreateBody) {
    //? check if phone exist
    const existing = await prisma.user.findUnique({
      where: {phoneNumber: data.phoneNumber},
    });

    if (existing) {
      throw new BadRequestException("تلفن همراه قبلا در سیستم ثبت شده است");
    }

    return await prisma.user.create({
      data: {
        phoneNumber: data.phoneNumber,
        name: data.name,
        lastName: data.lastName,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      },
    });
  }

  //! admin gets all users with pagination and search
  public async getAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};
    if (query.search) {
      where.OR = [
        {phoneNumber: {contains: query.search}},
        {name: {contains: query.search}},
        {lastName: {contains: query.search}},
        {email: {contains: query.search}},
      ];
    }

    if (query.role) {
      where.role = query.role
    }

    const [users,total] = await prisma.$transaction([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {createdAt: "desc"},
        //? select specific fields for security
        select: {
          id: true,
          phoneNumber: true,
          name: true,
          lastName: true,
          email: true,
          role: true,
          isActive: true
        }
      }),
      prisma.user.count({where}),
    ]);

    return {data: users, total, page, totalPage: Math.ceil(total / limit)}
  }

  //! profile actions
  //? get user profile 
  public async getOne(id: string) {
    const user = await prisma.user.findUnique({
      where: {id},
      include: {
        addresses: true,
        wishlist: {include: {product: {select: {name: true, slug: true, mainImage: true}}}},
        cart: {include: {items: true}}
      },
    });

    if (!user) throw new notFoundExeption("یوزری با این مشخصات موجود نیست");

    //? security: Remove otp fields befor returning
    const {otpCode, otpExpiresAt, ...safeUser} = user;
    return safeUser;
  }

  //! update profile logic
  public async update(id: string, data: IUserUpdateProfile | IUserUpdateAdmin, avatarUrl?: string){
    // user check
    const user = await prisma.user.findUnique({where: {id}});
    if (!user) throw new notFoundExeption("یوزری با این آیدی یافت نشد")

    return await prisma.user.update({
      where: {id},
      data: {
        ...data,
        avatar: avatarUrl || user.avatar,
      },
    });
  }

  //! remove soft or hard
  public async delete(id: string) {
    await prisma.user.delete({where: {id}});
  }
}

export const userService: UserService = new UserService();
