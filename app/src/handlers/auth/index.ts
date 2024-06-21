import { NextFunction, Request, Response } from "express";

export class AuthHandler {
  static async googleSignIn(req: Request, res: Response, next: NextFunction) {}
  static async googleCallback(
    req: Request,
    res: Response,
    next: NextFunction
  ) {}
  static async login(req: Request, res: Response, next: NextFunction) {}
  static async logout(req: Request, res: Response, next: NextFunction) {}
  static async register(req: Request, res: Response, next: NextFunction) {}
  static async resetPassword(req: Request, res: Response, next: NextFunction) {}
}