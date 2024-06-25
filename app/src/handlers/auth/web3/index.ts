import nacl from "tweetnacl";
import { NextFunction, Request, Response } from "express";
import { generateToken } from "../../../config/jwt";
import { USER } from "../../../types/common";
import { UserModel } from "../../../models/client/user";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { ethers } from "ethers";
import { v4 as uuidV4 } from "uuid";
import { AuthMessages } from "../../../db/schema";
import { db } from "../../../db";
import { eq } from "drizzle-orm";
export class WebAuthHandler {
  static async solanaRequestMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { address, chain, chain_id, network } = req.body;
      const nonce = uuidV4();
      const expiresIn = 10 * 60 * 1000; // 10 minutes
      const expiresAt = new Date(Date.now() + expiresIn);
      const message = `Please sign this message to confirm your identity.
Address: ${address}
Chain: ${chain}
Network: ${network}
Nonce: ${nonce}
Time: ${new Date().toISOString()}
Expires At: ${expiresAt.toISOString()}`;
      await db.insert(AuthMessages).values({
        nonce,
        message,
        address,
        chain,
        chain_id,
        expires_at: new Date(expiresAt),
      });
      res.json({
        data: message,
      });
    } catch (error) {}
  }
  static async ethereumRequestMessage(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { address, chain, network } = req.body;
      const nonce = uuidV4();
      const expiresIn = 10 * 60 * 1000; // 10 minutes
      const expiresAt = new Date(Date.now() + expiresIn);
      const message = `Please sign this message to confirm your identity.
Address: ${address}
Chain: ${chain}
Network: ${network}
Nonce: ${nonce}
Time: ${new Date().toISOString()}
Expires At: ${expiresAt.toISOString()}`;
      await db.insert(AuthMessages).values({
        nonce,
        message,
        address,
        chain,
        network,
        expires_at: new Date(expiresAt),
      });
      res.json({
        data: message,
      });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }

  static async solanaVerify(req: Request, res: Response, next: NextFunction) {
    try {
    } catch (error) {}
  }
  static async solana(req: Request, res: Response, next: NextFunction) {
    try {
      const { signature, message, application_id, network, chain, address } =
        req.body;

      const storedMessage = await db.query.AuthMessages.findFirst({
        where(fields, ops) {
          return ops.and(
            ops.eq(fields.address, address),
            ops.eq(fields.chain, chain)
          );
        },
      });
      if (new Date() > new Date(storedMessage?.expires_at as Date)) {
        return res.status(400).json({ error: "Message has expired" });
      }

      // Compare the received message with the stored message
      if (message !== storedMessage?.message) {
        return res.status(400).json({ error: "Invalid message" });
      }
      const publicKey = new PublicKey(address);
      const messageBytes = new TextEncoder().encode(message);
      const signatureBytes = bs58.decode(signature);
      const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      );
      if (!isValid) {
        return res.status(400).json({ data: null, error: "Invalid signature" });
      }
      if (isValid) {
        await db
          .delete(AuthMessages)
          .where(eq(AuthMessages.nonce, storedMessage?.nonce as string));
      }
      // Check if the user exists or create a new one
      let user = await UserModel.findOne(publicKey.toBase58(), application_id);

      if (!user) {
        user = await UserModel.create({
          address: publicKey.toBase58(),
          application_id,
          auth_type: "web3",
          network: network,
        });
      }

      const token = generateToken(user as USER);
      res.json({ data: token });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }
  static async ethereumVerify(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        message,
        signature,
        address,
        application_id,
        chain_id,
        network,
        chain,
      } = req.body;

      const storedMessage = await db.query.AuthMessages.findFirst({
        where(fields, ops) {
          return ops.and(
            ops.eq(fields.address, address),
            ops.eq(fields.chain, chain)
          );
        },
      });
      if (new Date() > new Date(storedMessage?.expires_at as Date)) {
        return res.status(400).json({ error: "Message has expired" });
      }

      // Compare the received message with the stored message
      if (message !== storedMessage?.message) {
        return res.status(400).json({ error: "Invalid message" });
      }
      const recoveredAddress = ethers.verifyMessage(message, signature);
      const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
      if (!isValid) {
        return res.status(400).json({ data: null, error: "Invalid signature" });
      }
      if (isValid) {
        await db
          .delete(AuthMessages)
          .where(eq(AuthMessages.nonce, storedMessage?.nonce as string));
      }
      let user = await UserModel.findOne(address, application_id);

      if (!user) {
        user = await UserModel.create({
          address,
          application_id,
          auth_type: "web3",
          chain_id,
          chain,
          network: network,
        });
      }

      const token = generateToken(user as USER);
      res.json({ data: token });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }
}
