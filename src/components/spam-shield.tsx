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
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Flame, ShieldAlert, Loader2, Info, Wallet } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContext, useState, useMemo, useEffect, useCallback } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { getStrictTokenMints } from "@/lib/jupiter-utils";
import { getExplorerUrl } from "@/lib/solana-utils";
import { Skeleton } from "./ui/skeleton";
import {
  Transaction,
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  PublicKey
} from "@solana/web3.js";
import { createCloseAccountInstruction, getAssociatedTokenAddressSync } from "@solana/spl-token";

type SpamToken = {
  name: string;
  icon: string;
  mint: string;
  tokenAccount: string;
};

const initialSpamTokens: SpamToken[] = [
  { name: "FREESOL.io", icon: "https://placehold.co/32x32.png", mint: '1', tokenAccount: '1' },
  { name: "ClaimWen.com", icon: "https://placehold.co/32x32.png", mint: '2', tokenAccount: '2' },
  { name: "1000XGEM.xyz", icon: "https://placehold.co/32x32.png", mint: '3', tokenAccount: '3' },
  { name: "USDC-Airdrop.net", icon: "https://placehold.co/32x32.png", mint: '4', tokenAccount: '4' },
];

const SOL_RECOVERY_PER_ACCOUNT = 0.00203928; // Rent for a token account

export function SpamShield({ className }: { className?: string }) {
  const { networkMode, isActionInProgress, setIsActionInProgress } = useContext(AppContext);
  const { connection } = useConnection();
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  const { toast } = useToast();
  
  const [spamTokens, setSpamTokens] = useState<SpamToken[]>(initialSpamTokens);
  const [isBalancesLoading, setIsBalancesLoading] = useState(false);
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());

  const isMainnet = networkMode === 'mainnet-beta';
  const isActionDisabled = (isMainnet && !connected) || isActionInProgress || selectedTokens.size === 0 || spamTokens.length === 0;

  const fetchSpamTokens = useCallback(async () => {
    if (!isMainnet || !connected || !publicKey) {
      setSpamTokens(initialSpamTokens);
      return;
    }

    setIsBalancesLoading(true);
    setSpamTokens([]);
    try {
      const [tokenAccounts, strictMints] = await Promise.all([
        connection.getParsedTokenAccountsByOwner(publicKey, { programId: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA") }),
        getStrictTokenMints()
      ]);

      const strictMintSet = new Set(strictMints);

      const potentialSpam = tokenAccounts.value
        .map(acc => {
          const parsedInfo = acc.account.data.parsed.info;
          return {
            mint: parsedInfo.mint,
            tokenAccount: acc.pubkey.toBase58(),
            balance: parsedInfo.tokenAmount.uiAmount,
          };
        })
        .filter(token => !strictMintSet.has(token.mint));
      
      setSpamTokens(potentialSpam.map(t => ({
        name: t.mint.slice(0, 12) + '...', // Truncate mint for display
        icon: 'https://placehold.co/32x32.png',
        mint: t.mint,
        tokenAccount: t.tokenAccount,
      })));

    } catch (error) {
      console.error(error);
      toast({
        title: "Error identifying spam",
        description: "Could not scan your wallet for spam tokens.",
        variant: "destructive",
      });
      setSpamTokens([]);
    } finally {
      setIsBalancesLoading(false);
    }
  }, [isMainnet, connected, publicKey, connection, toast]);

  useEffect(() => {
    fetchSpamTokens();
  }, [fetchSpamTokens]);

  useEffect(() => {
    return () => {
      setIsActionInProgress(false);
    };
  }, [setIsActionInProgress]);

  const handleToggleSelect = (tokenAccount: string) => {
    setSelectedTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tokenAccount)) {
        newSet.delete(tokenAccount);
      } else {
        newSet.add(tokenAccount);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTokens(new Set(spamTokens.map(t => t.tokenAccount)));
    } else {
      setSelectedTokens(new Set());
    }
  };

  const handleBurn = async () => {
    if (isActionDisabled) return;
    setIsActionInProgress(true);

    if (!isMainnet || !publicKey || !wallet.signAndSendTransaction) {
      // Devnet simulation
      const burnedCount = selectedTokens.size;
      const solRecovered = (burnedCount * SOL_RECOVERY_PER_ACCOUNT).toFixed(5);
      setTimeout(() => {
        setSpamTokens(prev => prev.filter(t => !selectedTokens.has(t.tokenAccount)));
        setSelectedTokens(new Set());
        setIsActionInProgress(false);
        toast({
          title: "Spam Burned! (Testnet)",
          description: `You burned ${burnedCount} spam tokens and recovered ${solRecovered} SOL.`,
        });
      }, 2000);
      return;
    }
    
    // Mainnet Logic
    try {
      const transaction = new Transaction();
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      // Add a priority fee
      transaction.add(
        ComputeBudgetProgram.setComputeUnitPrice({
          microLamports: 1000, // A modest priority fee
        })
      );

      for (const tokenAccount of selectedTokens) {
        transaction.add(
          createCloseAccountInstruction(
            new PublicKey(tokenAccount), // Account to close
            publicKey, // Destination for recovered SOL
            publicKey  // Owner of the account
          )
        );
      }

      const signature = await wallet.signAndSendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      toast({
        title: "Spam Burned!",
        description: `Burned ${selectedTokens.size} tokens. SOL recovered.`,
        action: (
          <a href={getExplorerUrl(signature, networkMode)} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">View Tx</Button>
          </a>
        )
      });
      setSelectedTokens(new Set());
      fetchSpamTokens();

    } catch (error) {
      console.error("Burn failed:", error);
      toast({
        title: "Burn Failed",
        description: (error as Error).message || "The transaction was not confirmed.",
        variant: "destructive",
      });
    } finally {
      setIsActionInProgress(false);
    }
  }

  const allSelected = useMemo(() => selectedTokens.size > 0 && selectedTokens.size === spamTokens.length, [selectedTokens, spamTokens]);

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
            <ShieldAlert className="w-6 h-6 text-primary" />
            Spam-Burn Shield
          </CardTitle>
          <CardDescription>
            Identify and burn unverified spam tokens to recover SOL rent fees.
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
          ) : spamTokens.length > 0 ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  Found {spamTokens.length} potential spam tokens.
                </p>
                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="select-all" 
                    checked={allSelected} 
                    onCheckedChange={(e) => handleSelectAll(e as boolean)}
                    disabled={(isMainnet && !connected) || isActionInProgress}
                  />
                  <Label htmlFor="select-all" className="text-sm">Select All</Label>
                </div>
              </div>
              <ScrollArea className="h-48 w-full pr-4">
                <div className="space-y-1">
                  {spamTokens.map((token) => (
                    <div
                      key={token.tokenAccount}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary/50"
                    >
                      <Checkbox 
                        id={token.tokenAccount} 
                        checked={selectedTokens.has(token.tokenAccount)}
                        onCheckedChange={() => handleToggleSelect(token.tokenAccount)}
                        disabled={(isMainnet && !connected) || isActionInProgress}
                      />
                      <div className="flex items-center gap-3 flex-1">
                        <Image
                          src={token.icon}
                          alt={`${token.name} icon`}
                          width={32}
                          height={32}
                          className="rounded-full"
                          data-ai-hint="danger warning"
                        />
                        <label
                          htmlFor={token.tokenAccount}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate font-mono"
                        >
                          {token.name}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-56 text-muted-foreground text-center gap-4">
               <Wallet className="w-12 h-12" />
              <p>{connected ? "No spam tokens found to burn." : "Connect your wallet to scan for spam."}</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground text-center">
            You can recover ~{(selectedTokens.size * SOL_RECOVERY_PER_ACCOUNT).toFixed(5)} SOL in rent fees by burning the selected tokens.
          </p>
          <Button variant="destructive" className="w-full" disabled={isActionDisabled} onClick={handleBurn}>
            {isActionInProgress ? <Loader2 className="animate-spin" /> : <Flame className="w-4 h-4" />}
            {isActionInProgress ? "Burning..." : `Burn ${selectedTokens.size} Selected Spam`}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
