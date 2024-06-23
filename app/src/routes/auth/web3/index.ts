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
  .post("/verify", () => {})
  .post("/solana", () => {})
  .post("/ethereum", () => {})
  .post("/request-message", () => {});

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

router.post("/solana", async (req, res) => {
  try {
    const { signature, message, application_id, network } = req.body;

    // Verify the signature
    const publicKey = new PublicKey(req.body.publicKey);
    const isValid = tweetnacl.verify(message, signature);

    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Check if the user exists or create a new one
    let user = await UserModel.findOne(publicKey.toBase58(), application_id);

    if (!user) {
      //@ts-ignore
      user = await UserModel.create({
        address: publicKey.toBase58(),
        application_id,
        auth_type: "web3",
        network: network || "solana",
      });
    }

    // Generate and return JWT token
    const token = generateToken(user as USER);
    res.json({ token });
  } catch (error: any) {
    res
      .status(500)
      .json({ error: error?.message || "Something went wrong..." });
  }
});
