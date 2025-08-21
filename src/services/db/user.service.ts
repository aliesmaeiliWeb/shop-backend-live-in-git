import { User } from "../../generated/prisma";
import { prisma } from "../../prisma";
import bcrypt from "bcrypt";
import { authService } from "./auth.service";
import {
  BadRequestException,
  notFoundExeption,
} from "../../globals/middlewares/error.middleware";

class UserService {
  public async add(requestBody: any) {
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

  public async edit(id: number, requestBody: any, currentUser: UserPayload) {
    const { name, lastName, avatar } = requestBody;
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

  public async editPassword(requestBody: any, currentUser: UserPayload) {
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
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });
  }

  public async get(id: number) {
    const user = await prisma.user.findFirst({
      where: { id },
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
}

export const userService: UserService = new UserService();
