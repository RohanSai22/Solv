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
import { Flame, ShieldAlert, Loader2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContext, useState, useMemo } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { Label } from "./ui/label";

const initialSpamTokens = [
  { name: "FREESOL.io", icon: "https://placehold.co/32x32.png" },
  { name: "ClaimWen.com", icon: "https://placehold.co/32x32.png" },
  { name: "1000XGEM.xyz", icon: "https://placehold.co/32x32.png" },
  { name: "USDC-Airdrop.net", icon: "https://placehold.co/32x32.png" },
  { name: "SolanaGiveaway.org", icon: "https://placehold.co/32x32.png" },
];

export function SpamShield({ className }: { className?: string }) {
  const { networkMode } = useContext(AppContext);
  const { connected } = useWallet();
  const { toast } = useToast();
  
  const [spamTokens, setSpamTokens] = useState(initialSpamTokens);
  const [selectedTokens, setSelectedTokens] = useState<Set<string>>(new Set());
  const [isBurning, setIsBurning] = useState(false);

  const isActionDisabled = (networkMode === 'mainnet-beta' && !connected) || isBurning || selectedTokens.size === 0;

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
    if (networkMode === 'devnet') {
      setIsBurning(true);
      setTimeout(() => {
        const burnedCount = selectedTokens.size;
        setSpamTokens(prev => prev.filter(t => !selectedTokens.has(t.name)));
        setSelectedTokens(new Set());
        setIsBurning(false);
        toast({
          title: "Spam Burned!",
          description: `You burned ${burnedCount} spam tokens and recovered 0.0015 SOL in rent fees.`,
        });
      }, 2000);
    } else {
       toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to burn spam on Mainnet.",
        variant: "destructive",
      });
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
      <Card className="flex flex-col w-full max-w-lg">
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
                    onCheckedChange={handleSelectAll} 
                    disabled={(networkMode === 'mainnet-beta' && !connected)}
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
                        disabled={(networkMode === 'mainnet-beta' && !connected)}
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
            {isBurning ? <Loader2 className="animate-spin" /> : <Flame className="w-4 h-4" />}
            {isBurning ? "Burning..." : `Burn ${selectedTokens.size} Selected Spam`}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
