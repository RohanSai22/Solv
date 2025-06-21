import type { NetworkMode } from "@/contexts/AppContext";
import { getJupiterApiUrl as getBaseUrl } from "@/config";

/**
 * Returns the correct Jupiter API base URL for the given network.
 * @param network - The network mode ('devnet' or 'mainnet-beta').
 * @returns The Jupiter API base URL.
 */
export function getJupiterApiUrl(network: NetworkMode): string {
  return getBaseUrl(network);
}

/**
 * Defines the priority fee level for a transaction.
 * @param network - The network mode.
 * @returns The priority fee configuration.
 */
export function getPriorityFee(network: NetworkMode): 'auto' | number {
  // Devnet doesn't typically require priority fees.
  if (network === 'devnet') {
    return 0;
  }
  // On mainnet, 'auto' is a safe default for Jupiter to handle it.
  return 'auto';
}
