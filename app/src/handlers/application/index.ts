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
  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { app_id } = req.params;
      const owner_id = req.user?.auth_id as string;
      const app = await ApplicationModel.findOne(app_id, owner_id);
      if (!app)
        return res
          .status(404)
          .json({ message: "Application not found", data: null });
      await ApplicationModel.update(app_id, req.body);
      res.json({ data: true, message: "Application updated successfully" });
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

      if (!app)
        return res
          .status(404)
          .json({ message: "Application not found", data: null });
      res.json({ data: app, message: "Application retrieved successfully" });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }
  static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const apps = await ApplicationModel.findMany();
      res.json({ data: apps, message: "Applications retrieved successfully" });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }
}
