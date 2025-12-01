import { Request, Response } from "express";
import { userService } from "../../../services/db/user.service";
import { HTTP_STATUS } from "../../../globals/constants/http";

class UserController {
  public async getMe(req: Request, res: Response) {
    //? user the id from the token
    const user = await userService.getOne(req.currentUser.id.toString());
    res.status(HTTP_STATUS.ok).json({ data: user });
  }

  public async updateMe(req: Request, res: Response) {
    //? if user tries to change role/isActive, we ignore it here
    const { role, isActive, ...safeBody } = req.body;
    const avatarUrl = req.file
      ? `/image/avatar/${req.file.filename}`
      : undefined;

    const updateUser = await userService.update(
      req.currentUser.id.toString(),
      safeBody,
      avatarUrl
    );

    res.status(HTTP_STATUS.ok).json({
      message: "آپدیت پروفایل موفقیت آمیز بود",
      data: updateUser,
    });
  }

  public async create(req: Request, res: Response) {
    const bodyData = { ...req.body };

    if (req.file) {
      bodyData.avatar = `/image/avatar/${req.file.filename}`;
    }

    if (bodyData.isActive === "true") bodyData.isActive = true;
    if (bodyData.isActive === "false") bodyData.isActive = false;

    const newUser = await userService.create(bodyData);
    res.status(HTTP_STATUS.create).json({
      message: "کاربر ساخته شد به وسیله ادمین",
      data: newUser,
    });
  }

  public async getAll(req: Request, res: Response) {
    const result = await userService.getAll(req.query);
    res.status(HTTP_STATUS.ok).json(result);
  }

  public async getOne(req: Request, res: Response) {
    const user = await userService.getOne(req.params.id);
    res.status(HTTP_STATUS.ok).json({ data: user });
  }

  public async update(req: Request, res: Response) {
    const avatarUrl = req.file
      ? `/image/avatar/${req.file.filename}`
      : undefined;

    if (req.body.isActive === "true") req.body.isActive = true;
    if (req.body.isActive === "false") req.body.isActive = false;

    const updateUser = await userService.update(
      req.params.id,
      req.body,
      avatarUrl
    );

    res.status(HTTP_STATUS.ok).json({
      message: "آپدیت کاربر موفقیت آمیز بود",
      data: updateUser,
    });
  }

  public async delete(req: Request, res: Response) {
    await userService.delete(req.params.id);
    res.status(HTTP_STATUS.ok).json({ message: "User deleted" });
  }
}

export const userController: UserController = new UserController();
