
import type { NetworkMode } from "@/contexts/AppContext";
import { getJupiterApiUrl as getBaseUrl } from "@/config";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { VersionedTransaction } from "@solana/web3.js";

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

// --- API Helper Functions for Swaps ---

type GetSwapTransactionParams = {
  inputMint: string;
  outputMint: string;
  amount: string;
  userPublicKey: string;
  networkMode: NetworkMode;
}

export async function getSwapTransaction({ inputMint, outputMint, amount, userPublicKey, networkMode }: GetSwapTransactionParams): Promise<VersionedTransaction> {
  const jupiterUrl = getJupiterApiUrl(networkMode);
  const priorityFee = getPriorityFee(networkMode);

  const params = new URLSearchParams({
    inputMint,
    outputMint,
    amount,
    userPublicKey,
    slippageBps: '50', // 0.5%
    prioritizationFeeLamports: priorityFee.toString(),
  });
  
  const response = await fetch(`${jupiterUrl}/order?${params.toString()}`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to get swap order from Jupiter API.");
  }
  const { tx } = await response.json();

  const transactionBuffer = Buffer.from(tx, 'base64');
  return VersionedTransaction.deserialize(transactionBuffer);
}

export async function signTransaction(transaction: VersionedTransaction, wallet: WalletContextState): Promise<VersionedTransaction> {
  if (!wallet.signTransaction) {
    throw new Error("Wallet does not support signing transactions.");
  }
  return await wallet.signTransaction(transaction);
}

export async function executeTransaction(signedTransaction: VersionedTransaction, networkMode: NetworkMode): Promise<string> {
    const jupiterUrl = getJupiterApiUrl(networkMode);
    
    const signedTxBase64 = Buffer.from(signedTransaction.serialize()).toString('base64');
    
    const response = await fetch(`${jupiterUrl}/execute`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ transaction: signedTxBase64 }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to execute transaction via Jupiter API.");
    }

    const { signature } = await response.json();
    return signature;
}
