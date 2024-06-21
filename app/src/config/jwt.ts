import jwt from "jsonwebtoken";
import { IUser } from "../types/common";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

export const generateToken = (user: IUser): string => {
  return jwt.sign({ id: user.auth_id }, JWT_SECRET, { expiresIn: "1d" });
};

export const generateRefreshToken = (user: IUser): string => {
  return jwt.sign({ id: user.auth_id }, JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

export const verifyToken = (token: string): any => {
  return jwt.verify(token, JWT_SECRET);
};
