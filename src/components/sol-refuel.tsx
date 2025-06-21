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
import { Droplets, Loader2, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { getJupiterApiUrl } from "@/lib/jupiter-utils";

export function SolRefuel({ className }: { className?: string }) {
  const { networkMode, isActionInProgress, setIsActionInProgress } = useContext(AppContext);
  const { connected } = useWallet();
  const { toast } = useToast();
  
  const isMainnet = networkMode === 'mainnet-beta';
  const isActionDisabled = (isMainnet && !connected) || isActionInProgress;

  useEffect(() => {
    return () => {
      setIsActionInProgress(false);
    };
  }, [setIsActionInProgress]);

  const handleRefuel = () => {
    if (isMainnet) {
      if (!connected) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet to refuel on Mainnet.",
          variant: "destructive",
        });
        return;
      }
      // Mainnet logic would go here
      console.log("Preparing to refuel on Mainnet using Jupiter API:", getJupiterApiUrl(networkMode));
       toast({
          title: "Mainnet Action",
          description: "Refueling on Mainnet is not yet implemented.",
      });
    } else {
      // Devnet simulation
      setIsActionInProgress(true);
      setTimeout(() => {
        setIsActionInProgress(false);
        toast({
          title: "Refuel Successful! (Testnet)",
          description: "Your SOL balance has been topped up.",
        });
      }, 1500);
    }
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
            <Droplets className="w-6 h-6 text-primary" />
            SOL Refuel
          </CardTitle>
          <CardDescription>
            Running low? Swap tokens for SOL to pay for gas.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md">
            <Info className="w-4 h-4" />
            <p>You are in <span className="font-bold">{networkMode === 'devnet' ? 'Testnet Mode' : 'Mainnet Mode'}</span>. {networkMode === 'devnet' && 'Actions are simulated.'}</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <p className="text-sm text-muted-foreground">Your SOL Balance</p>
              <p className="text-2xl font-bold font-mono">
                {networkMode === 'devnet' ? '1.25 SOL' : (connected ? '...' : '0.0000 SOL')}
              </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="refuel-amount">Get SOL Amount</Label>
            <Select defaultValue="0.02" disabled={isActionDisabled}>
              <SelectTrigger id="refuel-amount">
                <SelectValue placeholder="Select amount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.01">0.01 SOL</SelectItem>
                <SelectItem value="0.02">0.02 SOL</SelectItem>
                <SelectItem value="0.05">0.05 SOL</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="swap-token">Pay with</Label>
            <Select defaultValue="usdc" disabled={isActionDisabled}>
              <SelectTrigger id="swap-token">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usdc">USDC (~$2.90)</SelectItem>
                <SelectItem value="jup">JUP (~2.42 JUP)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={isActionDisabled} onClick={handleRefuel}>
            {isActionInProgress && <Loader2 className="animate-spin" />}
            {isActionInProgress ? 'Refueling...' : 'Refuel Now'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
