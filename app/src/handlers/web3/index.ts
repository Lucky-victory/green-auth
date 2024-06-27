import { Request, Response } from "express";
import { ethers } from "ethers";
import { Connection, PublicKey } from "@solana/web3.js";
import { getTokenFromHeaders, verifyToken } from "../../config/jwt";

interface BalanceResult {
  address: string | null;
  balance: string;
  chain: string;
  network: string | null;
}

export class MultiChainBalanceHandler {
  private static async getEthereumBalance(
    address: string,
    network: string
  ): Promise<string> {
    const rpcUrl = process.env[`ETHEREUM_${network.toUpperCase()}_RPC_URL`];
    if (!rpcUrl) {
      throw new Error(`No RPC URL configured for Ethereum ${network}`);
    }
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const balance = await provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  private static async getSolanaBalance(
    address: string,
    network: string
  ): Promise<string> {
    const rpcUrl = process.env[`SOLANA_${network.toUpperCase()}_RPC_URL`];
    if (!rpcUrl) {
      throw new Error(`No RPC URL configured for Solana ${network}`);
    }
    const connection = new Connection(rpcUrl, "confirmed");
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    return (balance / 1e9).toString(); // Convert lamports to SOL
  }

  static async getBalance(req: Request, res: Response) {
    try {
  
      const {user} =req

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      let balance: string;
      switch (user.chain?.toLowerCase()) {
        case "ethereum":
          balance = await MultiChainBalanceHandler.getEthereumBalance(
            user.address as string,
            user.network as string
          );
          break;
        case "solana":
          balance = await MultiChainBalanceHandler.getSolanaBalance(
            user.address as string,
            user.network as string
          );
          break;
        default:
          return res
            .status(400)
            .json({ error: `Unsupported chain: ${user.chain}` });
      }

      const result: BalanceResult = {
        address: user.address,
        balance,
        chain: user.chain,
        network: user.network,
      };

      res.json(result);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }

  static async getAllBalances(req: Request, res: Response) {
    try {
      const {user} =req

      if (!user) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const balances: BalanceResult[] = [];

      // Ethereum balances
      const ethereumNetworks = ["mainnet", "goerli", "sepolia"]; // Add or remove networks as needed
      for (const network of ethereumNetworks) {
        try {
          const balance = await MultiChainBalanceHandler.getEthereumBalance(
            user.address as string,
            network
          );
          balances.push({
            address: user.address,
            balance,
            chain: "ethereum",
            network,
          });
        } catch (error) {
          console.error(
            `Error fetching Ethereum balance for ${network}:`,
            error
          );
        }
      }

      // Solana balances
      const solanaNetworks = ["mainnet-beta", "testnet", "devnet"];
      for (const network of solanaNetworks) {
        try {
          const balance = await MultiChainBalanceHandler.getSolanaBalance(
            user.address as string,
            network
          );
          balances.push({
            address: user.address,
            balance,
            chain: "solana",
            network,
          });
        } catch (error) {
          console.error(`Error fetching Solana balance for ${network}:`, error);
        }
      }

      res.json(balances);
    } catch (error: any) {
      res
        .status(500)
        .json({ error: error?.message || "Something went wrong..." });
    }
  }
}
