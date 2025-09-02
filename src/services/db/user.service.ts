import { Prisma, Role, User } from "../../generated/prisma";
import { prisma } from "../../prisma";
import bcrypt from "bcrypt";
import { authService } from "./auth.service";
import {
  BadRequestException,
  forbiddenExeption,
  notFoundExeption,
} from "../../globals/middlewares/error.middleware";
import {
  IUserCreateBody,
  IUserUpdateBody,
  IUserUpdatePasswordBody,
} from "../../features/user/interface/user.interface";

class UserService {
  public async add(requestBody: IUserCreateBody) {
    const {
      email,
      name,
      lastName,
      avatar,
      password,
      role: roleStr,
      phoneNumber,
      isActive
    } = requestBody;

    if (await authService.isEmailAlreadyExist(email)) {
      throw new BadRequestException("email must be unique");
    }

    const hasHedPassword: string = await bcrypt.hash(password, 10);

    const role: Role = Role[roleStr as keyof typeof Role];

    //? insert to DB
    const newUser: User = await prisma.user.create({
      data: {
        email,
        name,
        lastName,
        avatar,
        password: hasHedPassword,
        role,
        phoneNumber,
        isActive: Boolean(isActive)
      },
    });

    return this.returnUser(newUser);
  }

  public async getAllUsers(options: {
    search?: string;
    role?: Role;
    page?: number;
    limit?: number;
  }) {
    const { search, role, page = 1, limit = 10 } = options;
    const skip = (page - 1) * limit;

    const whereClause: Prisma.UserWhereInput = {};

    if (role) {
      if (!Object.values(Role).includes(role)) {
        throw new BadRequestException("رول ارسال شده معتبر نیست");
      }
      whereClause.role = role;
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ];
    }

    const [user, totalUser] = await prisma.$transaction([
      prisma.user.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: skip,
      }),
      prisma.user.count({ where: whereClause }),
    ]);

    const userWithouPassword = user.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });

    return { data: userWithouPassword, total: totalUser };
  }

  public async getUserById(id: number) {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new notFoundExeption(`کاربری با آیدی ${id} پیدا نشد`);
    }

    const {password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  public async edit(
    id: number,
    requestBody: IUserUpdateBody,
    currentUser: UserPayload
  ) {
    const { name, lastName, avatar, phoneNumber, isActive } = requestBody;

    if (currentUser.id !== id && currentUser.role !== "Admin") {
      throw new forbiddenExeption("you cannot perform this actoin");
    }

    const user: User = await prisma.user.update({
      where: { id },
      data: {
        name,
        lastName,
        avatar,
        phoneNumber: phoneNumber,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    return this.returnUser(user);
  }

  public async getUserProfile(userId: number) {
    const userProfile = await prisma.user.findUnique({
      where: {id : userId},
      include: {
        addresses: true,
        order: {
          orderBy : {createdAt: "desc"},
          include: {
            items: true,
          },
        },
        comments: {
          orderBy: {createdAt: "desc"},
          include: {
            product: {select: {name: true}},
          },
        },
        wishlist: {
          include: {
            product: {select: {name: true}}
          },
        },
      },
    });

    if (!userProfile) {
      throw new notFoundExeption(`کاربر با شناسه ${userId} یافت نشد.`);
    }

    const {password, ...profileWithoutPassword} = userProfile;
    return profileWithoutPassword;
  }

  public async editPassword(
    requestBody: IUserUpdatePasswordBody,
    currentUser: UserPayload
  ) {
    const { currentPassword, newPassword, confirmNewPassword } = requestBody;

    const userInDB = await this.get(currentUser.id);

    if (!userInDB) {
      throw new notFoundExeption(`user dose not exist width id: ${userInDB}`);
    }

    const isMathPassword: boolean = await bcrypt.compare(
      currentPassword,
      userInDB.password!
    );

    if (!isMathPassword) {
      throw new notFoundExeption("password wrong!");
    }

    if (newPassword !== confirmNewPassword) {
      throw new notFoundExeption("password are not same!");
    }

    const hashedNewPassword: string = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        password: hashedNewPassword,
      },
    });
  }

  //+ just inActive user => not remove
  public async remove(id: number, currentUser: UserPayload) {
    if (currentUser.id !== id && currentUser.role !== "Admin") {
      throw new forbiddenExeption("you cannot perform this actoin");
    }
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  public async get(id: number, include?: Record<string, boolean>) {
    const query: any = { where: { id } };

    if (include && Object.keys(include).length > 0) {
      query.include = include;
    }

    const user = await prisma.user.findFirst(query);
    return user;
  }

  private returnUser(user: User) {
    return {
      email: user.email,
      name: user.name,
      lastName: user.lastName,
      avatar: user.avatar,
      role: user.role,
    };
  }

  public async editAvatar(
    file: Express.Multer.File | undefined,
    currentUser: UserPayload
  ) {
    if (!file) {
      throw new BadRequestException("please provide image");
    }

    console.log(file);

    await prisma.user.update({
      where: { id: currentUser.id },
      data: {
        avatar: file.filename,
      },
    });
  }
}

export const userService: UserService = new UserService();
