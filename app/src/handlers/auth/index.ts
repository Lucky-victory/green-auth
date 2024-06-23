import { NextFunction, Request, Response } from "express";
import { User } from "../../models/client/user";
import { generateToken } from "../../config/jwt";
import { IUser } from "../../types/common";
import bcrypt from "bcrypt";
import passport from "passport";

export class AuthHandler {
  static async register(req: Request, res: Response) {
    try {
      const { email, password, first_name } = req.body;
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await User.create({
        email,
        password: hashedPassword,
        first_name,
        auth_type: "email",
      });
      const token = generateToken(user as IUser);
      res.json({ token });
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
      (err: Error, user: IUser) => {
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
