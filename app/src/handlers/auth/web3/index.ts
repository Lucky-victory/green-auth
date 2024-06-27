import nacl from "tweetnacl";
import { NextFunction, Request, Response } from "express";
import {
  generateToken,
  getAppIdFromHeaderQueryOrBody,
} from "../../../config/jwt";
import { USER } from "../../../types/common";
import { UserModel } from "../../../models/client/user";
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";
import { ethers } from "ethers";
import { v4 as uuidV4 } from "uuid";
import { AuthMessages } from "../../../db/schema";
import { db } from "../../../db";
import { eq, and } from "drizzle-orm";

export class Web3AuthHandler {
  private static async createAuthMessage(
    address: string,
    chain: string,
    network: string,
    additionalInfo?: string
  ) {
    const nonce = uuidV4();
    const expiresIn = 10 * 60 * 1000; // 10 minutes
    const expiresAt = new Date(Date.now() + expiresIn);
    const message = `Please sign this message to confirm your identity.
Address: ${address}
Chain: ${chain}
Network: ${network}
Nonce: ${nonce}
Time: ${new Date().toISOString()}
Expires At: ${expiresAt.toISOString()}
${additionalInfo || ""}`;

    await db.insert(AuthMessages).values({
      nonce,
      message,
      address,
      chain,
      network,
      expires_at: expiresAt,
    });

    return message;
  }

  static async solanaRequestMessage(req: Request, res: Response) {
    try {
      const { address, chain, network } = req.body;
      const message = await Web3AuthHandler.createAuthMessage(
        address,
        chain,
        network
      );
      res.json({ data: message });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }

  static async ethereumRequestMessage(req: Request, res: Response) {
    try {
      const { address, chain, network } = req.body;
      const message = await Web3AuthHandler.createAuthMessage(
        address,
        chain,
        network
      );
      res.json({ data: message });
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }

  private static async verifyMessage(
    address: string,
    chain: string,
    message: string,
    signature: string,
    verifyFunction: (message: string, signature: string) => boolean
  ) {
    const storedMessage = await db.query.AuthMessages.findFirst({
      where: and(
        eq(AuthMessages.address, address),
        eq(AuthMessages.chain, chain)
      ),
    });

    if (!storedMessage) {
      throw new Error("No message found");
    }

    if (new Date() > new Date(storedMessage.expires_at as Date)) {
      throw new Error("Message has expired");
    }

    if (message !== storedMessage.message) {
      throw new Error("Invalid message");
    }

    const isValid = verifyFunction(message, signature);

    if (!isValid) {
      throw new Error("Invalid signature");
    }

    await db
      .delete(AuthMessages)
      .where(eq(AuthMessages.nonce, storedMessage.nonce));

    return true;
  }

  static async solanaVerify(req: Request, res: Response) {
    try {
      const { signature, message, network, chain, address } = req.body;
      const application_id = getAppIdFromHeaderQueryOrBody(req);

      await Web3AuthHandler.verifyMessage(
        address,
        chain,
        message,
        signature,
        (msg, sig) => {
          const publicKey = new PublicKey(address);
          const messageBytes = new TextEncoder().encode(msg);
          const signatureBytes = bs58.decode(sig);
          return nacl.sign.detached.verify(
            messageBytes,
            signatureBytes,
            publicKey.toBytes()
          );
        }
      );

      let user = await UserModel.findOne(address, application_id);

      if (!user) {
        user = await UserModel.create({
          address,
          application_id,
          auth_type: "web3",
          network,
          chain,
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

  static async ethereumVerify(req: Request, res: Response) {
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

      await Web3AuthHandler.verifyMessage(
        address,
        chain,
        message,
        signature,
        (msg, sig) => {
          const recoveredAddress = ethers.verifyMessage(msg, sig);
          return recoveredAddress.toLowerCase() === address.toLowerCase();
        }
      );

      let user = await UserModel.findOne(address, application_id);

      if (!user) {
        user = await UserModel.create({
          address,
          application_id,
          auth_type: "web3",
          chain_id,
          chain,
          network,
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
