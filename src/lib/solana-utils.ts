import type { NetworkMode } from "@/contexts/AppContext";

const SOLSCAN_BASE_URL = "https://solscan.io";

/**
 * Generates a Solscan URL for a given transaction, address, or token.
 * @param signature - The transaction signature, address, or token mint.
 * @param network - The network mode ('devnet' or 'mainnet-beta').
 * @param type - The type of link to generate ('tx', 'address', 'token').
 * @returns The full Solscan URL.
 */
export function getExplorerUrl(
  signature: string,
  network: NetworkMode,
  type: 'tx' | 'address' | 'token' = 'tx'
): string {
  const clusterParam = network === 'devnet' ? `?cluster=devnet` : '';
  return `${SOLSCAN_BASE_URL}/${type}/${signature}${clusterParam}`;
}
