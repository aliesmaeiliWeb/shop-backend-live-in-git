import { NextFunction, Request, Response } from "express";
import { prisma } from "../../../prisma";
import { BadRequestException } from "../../../globals/middlewares/error.middleware";
import { HTTP_STATUS } from "../../../globals/constants/http";
import { userService } from "../../../services/db/user.service";
// import { userSchemaCreate } from "../schema/user.schema";

class UserController {
  public async createUser(req: Request, res: Response, next: NextFunction) {
    const newUser = await userService.add(req.body);

    res.status(HTTP_STATUS.create).json({
      message: "create new user",
      data: {
        newUser,
      },
    });
  }

  public async getMe(req: Request, res: Response, next: NextFunction) {
    return res.status(HTTP_STATUS.ok).json(req.currentUser);
  }

  public async getAll(req: Request, res: Response) {
    const result = await userService.getAllUsers(req.query);

    return res.status(HTTP_STATUS.ok).json({
      message: "users geting successfully",
      ...result,
    });
  }

  public async getOne(req:Request, res:Response) {
    const userId = parseInt(req.params.id);
    const user = await userService.getUserById(userId);

    return res.status(HTTP_STATUS.ok).json({
      message: "user get by id is successfully",
      data: user
    })
  }

  public async getProfile(req:Request, res:Response) {
    const userId = parseInt(req.params.id);
    const userProfile = await userService.getUserProfile(userId);

    return res.status(HTTP_STATUS.ok).json({
      message: "get profile is successfully",
      data: userProfile,
    })
  }

  public async update(req: Request, res: Response) {
    const updateDataUser = await userService.edit(
      parseInt(req.params.id),
      req.body,
      req.currentUser
    );

    return res.status(HTTP_STATUS.ok).json({
      message: "update user",
      data: updateDataUser,
    });
  }

  public async changePassword(req: Request, res: Response) {
    await userService.editPassword(req.body, req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "update password successfully",
    });
  }

  public async delete(req: Request, res: Response) {
    await userService.remove(parseInt(req.params.id), req.currentUser);

    return res.status(HTTP_STATUS.ok).json({
      message: "delete user successfully",
    });
  }

  public async uploadAvatar(req: Request, res: Response) {
    await userService.editAvatar(req.file, req.currentUser);

    res.status(HTTP_STATUS.ok).json({
      message: "uploaded avatar successfully",
    });
  }
}

export const userController: UserController = new UserController();
