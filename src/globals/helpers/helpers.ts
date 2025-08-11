import { Product } from "../../generated/prisma";
import { forbiddenExeption } from "../middlewares/error.middleware";

export class Helper {
  public static checkPermission(product: Product, currentUser: UserPayload) {
    //+ for admin access
    if (currentUser.role === "Admin") return;
    //+ for shoper access
    if (currentUser.id === product!.shopId) return;

    throw new forbiddenExeption("you cannot perform this action");
  }
}
