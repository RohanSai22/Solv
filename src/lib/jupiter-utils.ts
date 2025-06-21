
import type { NetworkMode } from "@/contexts/AppContext";
import { getJupiterApiUrl as getBaseUrl } from "@/config";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { VersionedTransaction, type PublicKey } from "@solana/web3.js";

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


// --- API Helper Functions for Recurring Orders ---

export type RecurringOrderParams = {
  type: 'time';
  interval: 'MINUTE' | 'HOUR' | 'DAY' | 'WEEK' | 'MONTH';
  intervalValue: number;
  startDate: number; // Unix timestamp
  maxNumberOfExecutions: number;
};

export type RecurringOrder = {
  id: string; // This is the requestId
  user: string;
  inputMint: string;
  outputMint: string;
  inAmount: string;
  outAmount: string;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED' | 'COMPLETED' | 'PENDING';
  nextExecutionTime: string; // ISO 8601 date string
  lastExecution: {
    time: string;
    status: string;
    tx: string;
  } | null;
  params: RecurringOrderParams;
};

type CreateRecurringOrderResponse = {
  requestId: string;
  transaction: string; // base64
};

export async function createRecurringOrder({
  user, inputMint, outputMint, inAmount, params, networkMode
}: {
  user: PublicKey,
  inputMint: string,
  outputMint: string,
  inAmount: string, // in lamports
  params: RecurringOrderParams,
  networkMode: NetworkMode
}): Promise<CreateRecurringOrderResponse> {
  const jupiterUrl = getJupiterApiUrl(networkMode);
  const response = await fetch(`${jupiterUrl}/recurring/v1/createOrder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      user: user.toBase58(),
      inputMint,
      outputMint,
      inAmount,
      params,
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to create recurring order.");
  }
  return response.json();
}

export async function executeRecurringOrder({
  requestId, signedTransaction, networkMode
}: {
  requestId: string,
  signedTransaction: VersionedTransaction,
  networkMode: NetworkMode
}) {
  const jupiterUrl = getJupiterApiUrl(networkMode);
  const signedTxBase64 = Buffer.from(signedTransaction.serialize()).toString('base64');
  
  const response = await fetch(`${jupiterUrl}/recurring/v1/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, signedTransaction: signedTxBase64 }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to execute recurring order.");
  }
  return response.json();
}

export async function getRecurringOrders(user: PublicKey, networkMode: NetworkMode): Promise<RecurringOrder[]> {
  const jupiterUrl = getJupiterApiUrl(networkMode);
  const response = await fetch(`${jupiterUrl}/recurring/v1/getRecurringOrders?user=${user.toBase58()}`);
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to fetch recurring orders.");
  }
  return response.json();
}

export async function cancelRecurringOrder({
    requestId, user, networkMode
  }: {
  requestId: string,
  user: PublicKey,
  networkMode: NetworkMode
}) {
  const jupiterUrl = getJupiterApiUrl(networkMode);
  const response = await fetch(`${jupiterUrl}/recurring/v1/cancelOrder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requestId, user: user.toBase58() }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Failed to cancel recurring order.");
  }
  return response.json();
}

// --- API Helper Functions for Trigger Orders ---

export type TriggerOrderParams = {
  maker: PublicKey;
  inputMint: string;
  outputMint: string;
  makingAmount: string;
  takingAmount: string;
};

export type TriggerOrder = {
    id: string;
    maker: string;
    inputMint: string;
    outputMint: string;
    makingAmount: string;
    takingAmount: string;
    status: 'OPEN' | 'CANCELLED' | 'COMPLETED' | 'TRIGGERED';
    signature?: string;
}

type CreateTriggerOrderResponse = {
  requestId: string;
  transaction: string; // base64
};

export async function createTriggerOrder(params: TriggerOrderParams, networkMode: NetworkMode): Promise<CreateTriggerOrderResponse> {
    const jupiterUrl = getJupiterApiUrl(networkMode);
    const body = {
        maker: params.maker.toBase58(),
        inputMint: params.inputMint,
        outputMint: params.outputMint,
        makingAmount: params.makingAmount,
        takingAmount: params.takingAmount,
        payer: params.maker.toBase58(),
    }
    const response = await fetch(`${jupiterUrl}/trigger/v1/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.cause || "Failed to create trigger order.");
    }
    return response.json();
}

export async function executeTriggerOrder({ requestId, signedTransaction }: { requestId: string, signedTransaction: VersionedTransaction }, networkMode: NetworkMode) {
    const jupiterUrl = getJupiterApiUrl(networkMode);
    const signedTxBase64 = Buffer.from(signedTransaction.serialize()).toString('base64');
    const response = await fetch(`${jupiterUrl}/trigger/v1/execute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId, signedTransaction: signedTxBase64 }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.cause || "Failed to execute trigger order.");
    }
    return response.json();
}

export async function getTriggerOrders(user: PublicKey, networkMode: NetworkMode): Promise<TriggerOrder[]> {
    const jupiterUrl = getJupiterApiUrl(networkMode);
    const response = await fetch(`${jupiterUrl}/trigger/v1/orders?user=${user.toBase58()}`);
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.cause || "Failed to fetch trigger orders.");
    }
    return response.json();
}

export async function cancelTriggerOrder({ orderId, maker }: { orderId: string, maker: PublicKey }, networkMode: NetworkMode): Promise<CreateTriggerOrderResponse> {
    const jupiterUrl = getJupiterApiUrl(networkMode);
    const response = await fetch(`${jupiterUrl}/trigger/v1/cancelOrder`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, maker: maker.toBase58() }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.cause || "Failed to cancel trigger order.");
    }
    return response.json();
}
