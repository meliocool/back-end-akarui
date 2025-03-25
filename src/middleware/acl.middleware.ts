import { Response, NextFunction } from "express";
import { IReqUser } from "../utils/interfaces";
import response from "../utils/response";

export default (roles: string[]) => {
  // ['admin', 'user']
  return (req: IReqUser, res: Response, next: NextFunction) => {
    const role = req.user?.role; // 'manager' or 'member' for some reason jadinya di cek dulu
    if (!role || !roles.includes(role)) {
      return response.unauthorized(res, "Forbidden");
    }
    next();
  };
};
