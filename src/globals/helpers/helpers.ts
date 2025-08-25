import { Product } from "../../generated/prisma";
import { forbiddenExeption } from "../middlewares/error.middleware";

export class Helper {
  public static checkPermission<EntityType extends {[key: string]: any}>(
    entity: any,
    entityProduct: string,
    currentUser: UserPayload
  ) {
    //+ for admin access
    if (currentUser.role === "Admin") return;
    //+ for shoper access
    if (currentUser.id === entity![entityProduct]) return;

    throw new forbiddenExeption("you cannot perform this action");
  }
}
