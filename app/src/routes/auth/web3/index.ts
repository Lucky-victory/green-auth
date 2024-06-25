import { Router } from "express";
import tweetnacl from "tweetnacl";
import { etherProvider } from "../../../config/ethereum";
import { solanaConnection } from "../../../config/solana";
import { PublicKey } from "@solana/web3.js";
import { UserModel } from "../../../models/client/user";
import { generateToken } from "../../../config/jwt";

import ethers from "ethers";
import { USER } from "../../../types/common";
const router = Router();

router
  .post("/solana/verify", () => {})
  .post("/solana", () => {})
  .post("/solana/request-message", () => {})
  .post("/ethereum", () => {})
  .post("/ethereum/verify", () => {})
  .post("/ethereum/request-message", () => {});

export default router;
// import User from "../models/user";
// import { generateToken } from "../config/jwt";

// router.post("/ethereum", async (req, res) => {
//   try {
//     const { signature, message } = req.body;

//     // Verify the signature
//     const address = ethers.utils.verifyMessage(message, signature);

//     // Check if the user exists or create a new one
//     let user = await User.findOne({ ethereumAddress: address });

//     if (!user) {
//       user = await User.create({
//         ethereumAddress: address,
//       });
//     }

//     // Generate and return JWT token
//     const token = generateToken(user);
//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

router.post("/solana", async (req, res) => {});
