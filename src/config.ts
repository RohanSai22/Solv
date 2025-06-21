import type { NetworkMode } from "./contexts/AppContext";

export const config = {
  cluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'devnet',
  rpc: {
    devnet: process.env.NEXT_PUBLIC_DEVNET_RPC_URL!,
    'mainnet-beta': process.env.NEXT_PUBLIC_MAINNET_RPC_URL!,
  },
  jupiter: {
    devnet: process.env.NEXT_PUBLIC_JUPITER_API_URL_DEVNET!,
    'mainnet-beta': process.env.NEXT_PUBLIC_JUPITER_API_URL_MAINNET!,
  }
};

export const getRpcUrl = (network: NetworkMode): string => {
  return config.rpc[network];
}

export const getJupiterApiUrl = (network: NetworkMode): string => {
  return config.jupiter[network];
}
