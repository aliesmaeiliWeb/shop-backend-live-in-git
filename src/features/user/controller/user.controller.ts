import { NextFunction, Request, Response } from "express";
import { prisma } from "../../../prisma";
import { BadRequestException } from "../../../globals/middlewares/error.middleware";
import { HTTP_STATUS } from "../../../globals/constants/http";
// import { userSchemaCreate } from "../schema/user.schema";

class UserController {
  public async createUser(req: Request, res: Response, next:NextFunction) {
    const { email, name, lastName, avatar, password } = req.body;

    //? validate data check
    // const {error} = userSchemaCreate.validate(req.body);

    // if (error) {
    //   console.error("Validation error:", error.details);
    //   return;
    // };
    //! منتقل شد به ولیدیت میدلور دات تی اس و همچنین روت کنترلر یوزر

    //? insert to DB
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        lastName,
        avatar,
        password,
      },
    });

    res.status(201).json({
      message: "success add to db",
      data: {
        newUser,
      },
    }); // create
  }

  public async getMe(req: Request, res: Response, next:NextFunction) {
    return res.status(HTTP_STATUS.ok).json(req.currentUser)
  }
}

export const userController: UserController = new UserController();
