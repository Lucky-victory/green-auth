import { Router } from "express";

const router = Router();

router
  .get("/", (req, res) => {
    res.status(200).json({
      message: "Hi there, welcome to Green Auth Applications",
    });
  })
  .post("/new", (req, res) => {});

export default router;
