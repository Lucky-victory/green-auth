import ethers from "ethers";

interface etherProviderOptions {
  rpcUrl: string;
}
export function etherProvider({ rpcUrl }: etherProviderOptions) {
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  return provider;
}
