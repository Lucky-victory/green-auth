import { Request, Response, NextFunction } from "express";
import {
  getAppIdFromHeaderQueryOrBody,
  getTokenFromHeaders,
  verifyToken,
} from "../../config/jwt";
import { UserModel } from "../../models/client/user";
import { USER } from "../../types/common";

declare global {
  namespace Express {
    interface User extends USER {}
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = getTokenFromHeaders(req);
    if (!token) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const decoded = verifyToken(token);

    const appId = getAppIdFromHeaderQueryOrBody(req);
    const user = await UserModel.findByAuthId(decoded.id, appId);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    //@ts-ignore
    req.user = user;

    next();
  } catch (error) {
    console.log({ error });

    res.status(401).json({ error: "Invalid token" });
  }
};
export const appIdMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const appId = getAppIdFromHeaderQueryOrBody(req);
    if (!appId) {
      return res
        .status(401)
        .json({ error: "x-app-id header or app_id query missing" });
    }
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
