import { Connection, clusterApiUrl } from "@solana/web3.js";

export function solanaConnection(
  clusterApi: "devnet" | "mainnet-beta" | "testnet" = "devnet"
) {
  const connection = new Connection(clusterApiUrl(clusterApi));
  return connection;
}
