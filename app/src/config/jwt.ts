import jwt from "jsonwebtoken";
import { USER } from "../types/common";
import { Request } from "express";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_REFRESH_SECRET =
  process.env.JWT_REFRESH_SECRET || "your-refresh-secret-key";

export const generateToken = (user: Partial<USER>): string => {
  return jwt.sign(
    {
      id: user.auth_id,
      first_name: user.first_name,
      auth_type: user.auth_type,
      application_id: user.application_id,
      address: user.address,
      chain_id: user.chain_id,
    },
    JWT_SECRET,
    { expiresIn: "1d" }
  );
};
export const getTokenFromHeaders = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  return token;
};
/**
   get app id from header x-app-id or req.query or req.body
 *  */ 
export const getAppIdFromHeaderQueryOrBody = (req: Request):string|undefined => {
  const appId = req.headers["x-app-id"] as string;
  if (appId) {
    return appId;
  }
  return req.query.app_id || req.body.app_id;
};
export const generateRefreshToken = (user: Partial<USER>): string => {
  return jwt.sign(
    {
      id: user.auth_id,
      first_name: user.first_name,
      auth_type: user.auth_type,
      application_id: user.application_id,
      address: user.address,
      chain_id: user.chain_id,
    },
    JWT_REFRESH_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, JWT_SECRET) as {
    id: USER["auth_id"];
    first_name: USER["first_name"];
    auth_type: USER["auth_type"];
    application_id: USER["application_id"];
    address: USER["address"];
    chain_id: USER["chain_id"];
  };
};
