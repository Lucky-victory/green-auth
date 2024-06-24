import { NextFunction, Request, Response } from "express";
import { ApplicationModel } from "../../models/application";

export class ApplicationHandler {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;
      if (!name) throw new Error("application name must be provided");
      const owner_id = req.user?.auth_id as string;
      const app = await ApplicationModel.create({
        name,
        description,
        owner_id,
      });
      res.json({ data: app, message: "Application created successfully" });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }
  static async getOne(req: Request, res: Response, next: NextFunction) {
    try {
      const { app_id } = req.params;
      const owner_id = req.user?.auth_id as string;
      const app = await ApplicationModel.findOne(app_id, owner_id);
      res.json({ data: app });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const apps = await ApplicationModel.findMany();
      res.json({ data: apps });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }
}
