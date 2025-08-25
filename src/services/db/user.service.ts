import { User } from "../../generated/prisma";
import { prisma } from "../../prisma";
import bcrypt from "bcrypt";
import { authService } from "./auth.service";
import {
  BadRequestException,
  forbiddenExeption,
  notFoundExeption,
} from "../../globals/middlewares/error.middleware";
import { IUserCreateBody, IUserUpdateBody, IUserUpdatePasswordBody } from "../../features/user/interface/user.interface";

class UserService {
  public async add(requestBody: IUserCreateBody) {
    const { email, name, lastName, avatar, password } = requestBody;

    if (await authService.isEmailAlreadyExist(email)) {
      throw new BadRequestException("email must be unique");
    }

    const hasHedPassword: string = await bcrypt.hash(password, 10);

    //? insert to DB
    const newUser: User = await prisma.user.create({
      data: {
        email,
        name,
        lastName,
        avatar,
        password: hasHedPassword,
      },
    });

    return this.returnUser(newUser);
  }

  public async edit(id: number, requestBody: IUserUpdateBody, currentUser: UserPayload) {
    const { name, lastName, avatar } = requestBody;

    if (currentUser.id !== id && currentUser.role !== 'Admin') {
      throw new forbiddenExeption("you cannot perform this actoin");
    }

    const user: User = await prisma.user.update({
      where: { id },
      data: {
        name,
        lastName,
        avatar,
      },
    });

    return this.returnUser(user);
  }

  public async editPassword(requestBody: IUserUpdatePasswordBody, currentUser: UserPayload) {
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
    if (currentUser.id !== id && currentUser.role !== 'Admin') {
      throw new forbiddenExeption("you cannot perform this actoin"); 
    }
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  public async get(id: number, include= {}) {
    const user = await prisma.user.findFirst({
      where: { id },
      include
    });
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

  public async editAvatar(file: Express.Multer.File | undefined, currentUser: UserPayload) {
    if (!file) {
      throw new BadRequestException('please provide image');
    }

    console.log(file);

    await prisma.user.update({
      where: {id: currentUser.id},
      data: {
        avatar: file.filename
      }
    })
  }
}

export const userService: UserService = new UserService();
