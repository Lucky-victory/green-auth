import { Router } from "express";

import { etherProvider } from "../../../config/ethereum";
import { solanaConnection } from "../../../config/solana";
import { PublicKey } from "@solana/web3.js";
import User from "../../../models/client/user";
import { generateToken } from "../../../config/jwt";

import ethers from "ethers";
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
    const { signature, message } = req.body;

    // Verify the signature
    const publicKey = new PublicKey(req.body.publicKey);
    const isValid = solanaConnection().verifySignature(
      message,
      signature,
      publicKey
    );

    if (!isValid) {
      return res.status(400).json({ error: "Invalid signature" });
    }

    // Check if the user exists or create a new one
    let user = await User.findOne({ solanaAddress: publicKey.toString() });

    if (!user) {
      user = await User.create({
        solanaAddress: publicKey.toString(),
      });
    }

    // Generate and return JWT token
    const token = generateToken(user);
    res.json({ token });
  } catch (error: any) {
    res.status(500).json({ error: error?.message });
  }
});
