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


/**
 * Fetches Jupiter's strict token list.
 * This list contains tokens that are verified and considered safe.
 * @returns An array of token mint addresses.
 */
export async function getStrictTokenMints(): Promise<string[]> {
  try {
    // Note: The base URL for this specific endpoint is different from the trade APIs
    const response = await fetch('https://token.jup.ag/strict');
    if (!response.ok) {
      throw new Error('Failed to fetch strict token list');
    }
    const tokens: { address: string }[] = await response.json();
    return tokens.map(t => t.address);
  } catch (error) {
    console.error("Error fetching Jupiter's strict token list:", error);
    // Return a default list of common tokens as a fallback
    return [
      'So11111111111111111111111111111111111111112', // SOL
      'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // USDC
      'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN',  // JUP
    ];
  }
}
