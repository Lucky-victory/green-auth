import { NextFunction, Request, Response } from "express";
import { UserModel } from "../../models/client/user";
import { generateToken } from "../../config/jwt";
import { USER } from "../../types/common";
import bcrypt from "bcrypt";
import passport from "passport";
import isEmpty from "just-is-empty";

export class AuthHandler {
  static async register(req: Request, res: Response) {
    try {
      const {
        email,
        password,
        first_name,
        application_id,
        type,
        address,
        chain_id,
        auth_type,
        network,
      } = req.body;
      if (!application_id || !type || !auth_type)
        return res.status(400).json({
          error:
            "auth_type (email|google|github|web3), application_id and type(application | client) are required",
        });
      if (!email && !address)
        return res.status(400).json({ error: "email or address is required" });

      const hashedPassword = !isEmpty(password)
        ? await bcrypt.hash(password, 10)
        : null;

      const user = await UserModel.create({
        chain_id,
        address,
        email,
        password: hashedPassword,
        type,
        first_name,
        auth_type,
        application_id,
        network,
      });
      const token = generateToken(user as USER);
      return res.json({ token });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }
  static async login(req: Request, res: Response, next: NextFunction) {
    passport.authenticate(
      "local",
      { session: false },
      (err: Error, user: USER) => {
        if (err || !user) {
          return res.status(400).json({ error: "Invalid credentials" });
        }
        const token = generateToken(user);
        res.json({ token });
      }
    )(req, res, next);
  }
  static async logout(req: Request, res: Response) {
    try {
    } catch (error) {}
  }
  static async googleLogin(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google", {
      session: false,
      scope: ["profile", "email"],
    })(req, res, next);
  }
  static async googleCallback(req: Request, res: Response, next: NextFunction) {
    passport.authenticate("google", { session: false }, (err, user) => {
      if (err || !user) {
        return res.status(400).json({ error: "Authentication failed" });
      }
      const token = generateToken(user);
      res.json({ token });
    })(req, res, next);
  }
}
