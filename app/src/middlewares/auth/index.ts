import { Request, Response, NextFunction } from "express";
import { verifyToken } from "../../config/jwt";
import { clientUser } from "../../models/client/user";
import { AuthService } from "../../services/auth";
import { IUser } from "../../types/common";

declare global {
  namespace Express {
    interface User extends IUser {}
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = AuthService.getApiKeyFromHeader(req);
    if (!authHeader) {
      return res.status(401).json({ error: "Authorization header missing" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    const user = await User.findByAuthId(decoded.id);

    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    //@ts-ignore
    req.user = user;

    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};
