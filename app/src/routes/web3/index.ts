import express from "express";
import { MultiChainBalanceHandler } from "../../handlers/web3";
import { authMiddleware } from "../../middlewares/auth";

const app = express();

app.get("/api/balance", authMiddleware, MultiChainBalanceHandler.getBalance);
app.get(
  "/api/balances",
  authMiddleware,
  MultiChainBalanceHandler.getAllBalances
);
