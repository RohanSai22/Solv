
"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Info, Wallet, RotateCw } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContext, useState, useEffect, useCallback } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { getSwapTransaction, executeTransaction, signTransaction, getStrictTokenMints } from "@/lib/jupiter-utils";
import { getExplorerUrl } from "@/lib/solana-utils";
import { Skeleton } from "./ui/skeleton";
import type { VersionedTransaction } from "@solana/web3.js";
import { PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

type TokenMeta = {
  address: string;
  decimals: number;
  symbol: string;
  logoURI: string;
  name: string;
};

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';

export function DustSweeper({ className }: { className?: string }) {
  const { 
    networkMode, 
    isActionInProgress, 
    setIsActionInProgress, 
    dustTokens,
    setDustTokens,
    devnetUsdcBalance,
    setDevnetUsdcBalance,
    addMoreDust
  } = useContext(AppContext);
  
  const { connection } = useConnection();
  const solanaWallet = useWallet();
  const { toast } = useToast();

  const [isBalancesLoading, setIsBalancesLoading] = useState(false);
  const [sweepStatus, setSweepStatus] = useState('');

  const { connected, publicKey, signTransaction: signTx } = solanaWallet;

  const isMainnet = networkMode === 'mainnet-beta';
  const isActionDisabled = (isMainnet && !connected) || isActionInProgress || dustTokens.length === 0;

  const fetchBalances = useCallback(async () => {
    if (!isMainnet) {
      // Testnet data is handled by context, no need to fetch.
      return;
    }
    if (!connected || !publicKey) {
      setDustTokens([]);
      return;
    }
    
    setIsBalancesLoading(true);
    try {
        const [tokenAccounts, strictMints, allTokenMeta] = await Promise.all([
            connection.getParsedTokenAccountsByOwner(publicKey, { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }),
            getStrictTokenMints(),
            fetch(`https://token.jup.ag/all`).then(res => res.json()) as Promise<TokenMeta[]>
        ]);

        const strictMintSet = new Set(strictMints);
        strictMintSet.add(USDC_MINT); // Also exclude USDC itself from being swept

        const tokenMetaMap = new Map(allTokenMeta.map(t => [t.address, t]));

        const potentialDust = tokenAccounts.value
            .map(acc => {
                const parsedInfo = acc.account.data.parsed.info;
                return {
                    mint: parsedInfo.mint,
                    amount: parsedInfo.tokenAmount.uiAmountString,
                    rawAmount: parsedInfo.tokenAmount.amount,
                    decimals: parsedInfo.tokenAmount.decimals,
                };
            })
            .filter(token => {
                const hasBalance = parseFloat(token.amount) > 0;
                const isNFT = token.decimals === 0 && BigInt(token.rawAmount) === 1n;
                const isNotMajorToken = !strictMintSet.has(token.mint);
                
                return hasBalance && !isNFT && isNotMajorToken;
            })
            .map(token => {
                const meta = tokenMetaMap.get(token.mint);
                return {
                    name: meta?.symbol || token.mint.slice(0, 6) + '...',
                    amount: token.amount,
                    icon: meta?.logoURI || `https://placehold.co/32x32.png`,
                    mint: token.mint,
                    rawAmount: token.rawAmount,
                    solValue: 0, // Not used, kept for type compatibility with context
                };
            });
        
        setDustTokens(potentialDust);
    } catch (error) {
        console.error(error);
        toast({ title: "Error Fetching Balances", description: (error as Error).message, variant: "destructive" });
        setDustTokens([]);
    } finally {
        setIsBalancesLoading(false);
    }
  }, [isMainnet, connected, publicKey, connection, toast, setDustTokens]);

  useEffect(() => {
    if (isMainnet && connected) {
        fetchBalances();
    }
  }, [isMainnet, connected, fetchBalances]);
  
  useEffect(() => {
    return () => { setIsActionInProgress(false); };
  }, [setIsActionInProgress]);
  
  const handleSweep = async () => {
    if (isActionDisabled) return;
    setIsActionInProgress(true);

    if (!isMainnet) {
        // Testnet / EVM Simulation
        const totalCount = dustTokens.length;
        let usdcRecovered = 0;
        for (let i = 0; i < totalCount; i++) {
            const token = dustTokens[i];
            usdcRecovered += 0.05; // Mock 5 cents recovery per token
            setSweepStatus(`Sweeping ${token.name}... (${i + 1}/${totalCount})`);
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        setDevnetUsdcBalance(prev => prev + usdcRecovered);
        setDustTokens([]);
        setSweepStatus('');
        setIsActionInProgress(false);
        toast({
            title: "Dust Swept! (Testnet)",
            description: `You successfully converted ${totalCount} tokens and recovered ~${usdcRecovered.toFixed(2)} USDC.`,
        });
        return;
    }

    // Solana Mainnet Logic
    if (!publicKey || !signTx) {
        toast({ title: "Wallet not connected", variant: "destructive" });
        setIsActionInProgress(false);
        return;
    }
    
    let successCount = 0;
    let lastTxSignature = '';
    const totalCount = dustTokens.length;

    for (let i = 0; i < totalCount; i++) {
      const token = dustTokens[i];
      setSweepStatus(`Sweeping ${token.name}... (${i + 1}/${totalCount})`);
      try {
        const tx = await getSwapTransaction({
          inputMint: token.mint, 
          outputMint: USDC_MINT, 
          amount: token.rawAmount, 
          userPublicKey: publicKey.toBase58(), 
          networkMode: networkMode
        });
        const signedTx = await signTx(tx as VersionedTransaction);
        const signature = await executeTransaction(signedTx as VersionedTransaction, networkMode);
        lastTxSignature = signature;
        successCount++;
      } catch (error) {
        console.error(`Failed to sweep ${token.name}:`, error);
        // Don't overwhelm with toasts, but log the error. The final toast will indicate partial success.
        break; 
      }
    }

    setSweepStatus('');

    if (successCount > 0) {
      toast({
        title: "Sweep Complete!",
        description: `Successfully swept ${successCount} of ${totalCount} tokens to USDC.`,
        action: lastTxSignature ? (
          <a href={getExplorerUrl(lastTxSignature, networkMode)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">View Last Tx</Button>
          </a>
        ) : undefined,
      });
    } else {
        toast({
            title: "Sweep Failed",
            description: "Could not sweep any tokens. Please try again later.",
            variant: "destructive"
        });
    }

    await fetchBalances();
    setIsActionInProgress(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="flex flex-col w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent" />
            Dust Sweeper
          </CardTitle>
          <CardDescription>
            Consolidate small token balances from your Solana wallet into USDC.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md">
            <Info className="w-4 h-4" />
            <p>You are in <span className="font-bold">{isMainnet ? 'Mainnet Mode' : 'Testnet Mode'}</span>. Actions are {isMainnet ? 'live on Solana' : 'simulated'}.</p>
          </div>
          {isBalancesLoading && isMainnet ? (
            <div className="space-y-3 h-48">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : dustTokens.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Found {dustTokens.length} dust tokens in your wallet. Ready to sweep to USDC.
              </p>
              <ScrollArea className="h-48 w-full pr-4">
                <div className="space-y-3">
                  {dustTokens.map((token) => (
                    <div key={token.mint} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src={token.icon}
                          alt={`${token.name} icon`}
                          width={32}
                          height={32}
                          className="rounded-full bg-muted"
                          data-ai-hint="crypto token"
                          unoptimized
                        />
                        <div>
                          <p className="font-bold">{token.name}</p>
                          <p className="text-xs text-muted-foreground">{token.amount}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center gap-4">
              <Wallet className="w-12 h-12" />
              <p>{connected ? `No dust tokens found in this wallet. Your wallet is clean!` : "Connect your wallet to scan for dust."}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2">
          {isActionInProgress ? (
             <div className="text-sm text-center w-full">{sweepStatus}</div>
          ) : (
            <>
            {!isMainnet && (
                <Button variant="outline" className="w-full sm:w-auto" onClick={addMoreDust}>
                  <RotateCw />
                  Find More Dust
                </Button>
            )}
            <Button className="w-full" disabled={isActionDisabled} onClick={handleSweep}>
              <Sparkles className="w-4 h-4" />
              Sweep All to USDC
            </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}
