import { Router } from "express";
import { Web3AuthHandler } from "../../../handlers/auth/web3";
import { appIdMiddleware } from "../../../middlewares/auth";

const router = Router();

router
  .post("/solana/verify", appIdMiddleware, Web3AuthHandler.solanaVerify)
  .post("/solana", () => {})
  .post("/solana/request-message", Web3AuthHandler.solanaRequestMessage)
  .get("/ethereum", (req, res) => {
    res.json({
      message: "Ethereum  auth",
    });
  })
  .post("/ethereum/verify", appIdMiddleware, Web3AuthHandler.ethereumVerify)
  .post("/ethereum/request-message", Web3AuthHandler.ethereumRequestMessage);

export default router;
