import { Router } from "express";
import { authMiddleware } from "../../middlewares/auth";
import { ApplicationHandler } from "../../handlers/application";

const router = Router();

router
  .get("/", ApplicationHandler.getAll)
  .post("/", authMiddleware, ApplicationHandler.create)
  .get("/:app_id", ApplicationHandler.getOne)
  .use(authMiddleware)
  .put("/:app_id", ApplicationHandler.update)
  .post("/new", ApplicationHandler.create);

export default router;
