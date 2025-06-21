
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sparkles, Loader2, Info, Wallet } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContext, useState, useEffect, useCallback } from "react";
import { AppContext } from "@/contexts/AppContext";
import type { WalletContextState } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { getJupiterApiUrl, getPriorityFee, getSwapTransaction, executeTransaction, signTransaction } from "@/lib/jupiter-utils";
import { getExplorerUrl } from "@/lib/solana-utils";
import { Skeleton } from "./ui/skeleton";
import type { VersionedTransaction } from "@solana/web3.js";

// Define a type for the token data we expect from Jupiter's /balances
type TokenBalance = {
  address: string;
  decimals: number;
  amount: string;
  uiAmount: number;
  symbol: string;
  logoURI: string;
  name: string;
  price_per_token: number;
  coingecko_id: string;
};

// Define the dust threshold in USD
const DUST_THRESHOLD_USD = 0.5;

// Initial mock data for Devnet
const initialDustTokens = [
  { name: "LOWB", amount: "0.0012", icon: "https://placehold.co/32x32.png", mint: "lowb-mint-addr", rawAmount: "120" },
  { name: "TINY", amount: "0.0005", icon: "https://placehold.co/32x32.png", mint: "tiny-mint-addr", rawAmount: "50" },
  { name: "屑", amount: "1.53", icon: "https://placehold.co/32x32.png", mint: "kuzu-mint-addr", rawAmount: "1530" },
  { name: "PEANUT", amount: "10.2", icon: "https://placehold.co/32x32.png", mint: "peanut-mint-addr", rawAmount: "10200" },
];

export function DustSweeper({ className }: { className?: string }) {
  const { networkMode, isActionInProgress, setIsActionInProgress } = useContext(AppContext);
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  const { toast } = useToast();

  const [dustTokens, setDustTokens] = useState<any[]>(initialDustTokens);
  const [isBalancesLoading, setIsBalancesLoading] = useState(false);
  const [outputToken, setOutputToken] = useState('SOL');
  const [sweepStatus, setSweepStatus] = useState('');

  const isMainnet = networkMode === 'mainnet-beta';
  const isActionDisabled = (isMainnet && !connected) || isActionInProgress || dustTokens.length === 0;

  const fetchBalances = useCallback(async () => {
    if (!isMainnet || !connected || !publicKey) {
      setDustTokens(initialDustTokens);
      return;
    }

    setIsBalancesLoading(true);
    setDustTokens([]);
    try {
      const jupiterUrl = getJupiterApiUrl(networkMode);
      const response = await fetch(`${jupiterUrl}/balances/${publicKey.toBase58()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch balances.');
      }
      const allTokens: TokenBalance[] = await response.json();
      
      const filteredDust = allTokens.filter(token => {
        const usdValue = token.uiAmount * token.price_per_token;
        return usdValue > 0 && usdValue < DUST_THRESHOLD_USD;
      }).map(token => ({
        name: token.symbol,
        amount: token.uiAmount.toFixed(6),
        icon: token.logoURI,
        mint: token.address,
        rawAmount: token.amount,
      }));

      setDustTokens(filteredDust);

    } catch (error) {
      console.error(error);
      toast({
        title: "Error Fetching Balances",
        description: "Could not retrieve your token balances. Please try again later.",
        variant: "destructive",
      });
      setDustTokens([]);
    } finally {
      setIsBalancesLoading(false);
    }
  }, [isMainnet, connected, publicKey, networkMode, toast]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);
  
  useEffect(() => {
    return () => {
      setIsActionInProgress(false);
    };
  }, [setIsActionInProgress]);
  
  const handleSweep = async () => {
    if (isActionDisabled) return;

    setIsActionInProgress(true);

    if (!isMainnet) {
      const totalCount = dustTokens.length;
      for (let i = 0; i < totalCount; i++) {
        setSweepStatus(`Sweeping ${dustTokens[i].name}... (${i + 1}/${totalCount})`);
        await new Promise(resolve => setTimeout(resolve, 700));
      }
      setDustTokens([]);
      setSweepStatus('');
      setIsActionInProgress(false);
      toast({
        title: "Dust Swept! (Testnet)",
        description: `You successfully converted ${totalCount} tokens and earned some ${outputToken}.`,
      });
      return;
    }

    if (!connected || !publicKey) {
        toast({ title: "Wallet not connected", variant: "destructive" });
        setIsActionInProgress(false);
        return;
    }
    
    const outputTokenMint = outputToken === 'SOL' ? 'So11111111111111111111111111111111111111112' : 
                            outputToken === 'USDC' ? 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' : 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN';
    let successCount = 0;
    let lastTxSignature = '';
    const totalCount = dustTokens.length;

    for (let i = 0; i < totalCount; i++) {
      const token = dustTokens[i];
      setSweepStatus(`Sweeping ${token.name}... (${i + 1}/${totalCount})`);
      try {
        const tx = await getSwapTransaction({
          inputMint: token.mint, 
          outputMint: outputTokenMint, 
          amount: token.rawAmount, 
          userPublicKey: publicKey.toBase58(), 
          networkMode: networkMode
        });
        const signedTx = await signTransaction(tx, wallet);
        const signature = await executeTransaction(signedTx, networkMode);
        lastTxSignature = signature;
        successCount++;
      } catch (error) {
        console.error(`Failed to sweep ${token.name}:`, error);
        toast({
            title: `Sweep Failed for ${token.name}`,
            description: (error as Error).message || "An unknown error occurred.",
            variant: "destructive",
        });
        break; 
      }
    }

    setSweepStatus('');

    if (successCount > 0) {
      toast({
        title: "Sweep Complete!",
        description: `Successfully swept ${successCount} of ${totalCount} tokens.`,
        action: lastTxSignature ? (
          <a href={getExplorerUrl(lastTxSignature, networkMode)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">View Last Tx</Button>
          </a>
        ) : undefined,
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
            Consolidate small token balances from Solana and other connected wallets into a useful asset.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md">
            <Info className="w-4 h-4" />
            <p>You are in <span className="font-bold">{networkMode === 'devnet' ? 'Testnet Mode' : 'Mainnet Mode'}</span>. {networkMode === 'devnet' && 'Actions are simulated.'}</p>
          </div>
          {isBalancesLoading ? (
            <div className="space-y-3 h-48">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : dustTokens.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Found {dustTokens.length} dust tokens in your wallet.
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
              <p>{connected ? "No dust tokens found. Your wallet is clean!" : "Connect your wallet to scan for dust."}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2">
          {isActionInProgress ? (
             <div className="text-sm text-center w-full">{sweepStatus}</div>
          ) : (
            <>
            <Select defaultValue={outputToken} onValueChange={setOutputToken} disabled={isActionDisabled}>
              <SelectTrigger>
                <SelectValue placeholder="Convert to" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SOL">Solana (SOL)</SelectItem>
                <SelectItem value="JUP">Jupiter (JUP)</SelectItem>
                <SelectItem value="USDC">USDC</SelectItem>
              </SelectContent>
            </Select>
            <Button className="w-full sm:w-auto" disabled={isActionDisabled} onClick={handleSweep}>
              <Sparkles className="w-4 h-4" />
              Sweep All
            </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </motion.div>
  );
}

    