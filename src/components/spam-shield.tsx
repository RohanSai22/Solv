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
import { Flame, ShieldAlert, Loader2, Info } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContext, useState, useMemo, useEffect } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";
import { getJupiterApiUrl } from "@/lib/jupiter-utils";

const initialSpamTokens = [
  { name: "FREESOL.io", icon: "https://placehold.co/32x32.png" },
  { name: "ClaimWen.com", icon: "https://placehold.co/32x32.png" },
  { name: "1000XGEM.xyz", icon: "https://placehold.co/32x32.png" },
  { name: "USDC-Airdrop.net", icon: "https://placehold.co/32x32.png" },
  { name: "SolanaGiveaway.org", icon: "https://placehold.co/32x32.png" },
];

export function SpamShield({ className }: { className?: string }) {
  const { networkMode, isActionInProgress, setIsActionInProgress } = useContext(AppContext);
  const { connected } = useWallet();
  const { toast } = useToast();
  
  const [spamTokens, setSpamTokens] = useState(initialSpamTokens);
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());

  const isMainnet = networkMode === 'mainnet-beta';
  const isActionDisabled = (isMainnet && !connected) || isActionInProgress || selectedTokens.size === 0;

  useEffect(() => {
    return () => {
      setIsActionInProgress(false);
    };
  }, [setIsActionInProgress]);

  const handleToggleSelect = (tokenName: string) => {
    setSelectedTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tokenName)) {
        newSet.delete(tokenName);
      } else {
        newSet.add(tokenName);
      }
      return newSet;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTokens(new Set(spamTokens.map(t => t.name)));
    } else {
      setSelectedTokens(new Set());
    }
  };

  const handleBurn = () => {
    if (isMainnet) {
      if (!connected) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet to burn spam on Mainnet.",
          variant: "destructive",
        });
        return;
      }
      // Mainnet logic would go here
      console.log("Preparing to burn on Mainnet using Jupiter API:", getJupiterApiUrl(networkMode));
      toast({
        title: "Mainnet Action",
        description: "Burning on Mainnet is not yet implemented.",
      });
    } else {
      // Devnet simulation
      setIsActionInProgress(true);
      setTimeout(() => {
        const burnedCount = selectedTokens.size;
        const solRecovered = (burnedCount * 0.0003).toFixed(4);
        setSpamTokens(prev => prev.filter(t => !selectedTokens.has(t.name)));
        setSelectedTokens(new Set());
        setIsActionInProgress(false);
        toast({
          title: "Spam Burned! (Testnet)",
          description: `You burned ${burnedCount} spam tokens and recovered ${solRecovered} SOL in rent fees.`,
        });
      }, 2000);
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
            Identify and burn unverified spam tokens to recover SOL.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md">
            <Info className="w-4 h-4" />
            <p>You are in <span className="font-bold">{networkMode === 'devnet' ? 'Testnet Mode' : 'Mainnet Mode'}</span>. {networkMode === 'devnet' && 'Actions are simulated.'}</p>
          </div>
          {spamTokens.length > 0 ? (
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
                    disabled={(isMainnet && !connected)}
                  />
                  <Label htmlFor="select-all" className="text-sm">Select All</Label>
                </div>
              </div>
              <ScrollArea className="h-48 w-full pr-4">
                <div className="space-y-1">
                  {spamTokens.map((token) => (
                    <div
                      key={token.name}
                      className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary/50"
                    >
                      <Checkbox 
                        id={token.name} 
                        checked={selectedTokens.has(token.name)}
                        onCheckedChange={() => handleToggleSelect(token.name)}
                        disabled={(isMainnet && !connected)}
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
                          htmlFor={token.name}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 truncate"
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
            <div className="flex items-center justify-center h-56 text-muted-foreground">
              <p>No spam tokens found. Your wallet is clean!</p>
            </div>
          )}
        </CardContent>
        <CardFooter>
          <Button variant="destructive" className="w-full" disabled={isActionDisabled} onClick={handleBurn}>
            {isActionInProgress ? <Loader2 className="animate-spin" /> : <Flame className="w-4 h-4" />}
            {isActionInProgress ? "Burning..." : `Burn ${selectedTokens.size} Selected Spam`}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
