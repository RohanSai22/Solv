import type { NetworkMode } from "./contexts/AppContext";

export const config = {
  cluster: process.env.NEXT_PUBLIC_SOLANA_CLUSTER || 'devnet',
  rpc: {
    devnet: process.env.NEXT_PUBLIC_DEVNET_RPC_URL || 'https://api.devnet.solana.com',
    'mainnet-beta': process.env.NEXT_PUBLIC_MAINNET_RPC_URL || 'https://rpc.ankr.com/solana',
  },
  jupiter: {
    devnet: process.env.NEXT_PUBLIC_JUPITER_API_URL_DEVNET || 'https://lite-api.jup.ag',
    'mainnet-beta': process.env.NEXT_PUBLIC_JUPITER_API_URL_MAINNET || 'https://lite-api.jup.ag',
  }
};

export const getRpcUrl = (network: NetworkMode): string => {
  return config.rpc[network];
}

export const getJupiterApiUrl = (network: NetworkMode): string => {
  return config.jupiter[network];
}
