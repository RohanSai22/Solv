
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
import { Droplets, Loader2, Info, Wallet } from "lucide-react";
import { motion } from "framer-motion";
import { useContext, useState, useEffect, useMemo, useCallback } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { getJupiterApiUrl, getSwapTransaction, executeTransaction, signTransaction } from "@/lib/jupiter-utils";
import { LAMPORTS_PER_SOL } from "@solana/web3.js";
import { Skeleton } from "./ui/skeleton";
import { getExplorerUrl } from "@/lib/solana-utils";

const LOW_SOL_THRESHOLD = 0.05 * LAMPORTS_PER_SOL; // 0.05 SOL

const REFUEL_OPTIONS = [
  { value: '1000000', label: '1 USDC', inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', approxSOL: 0.007, cost: 1 },
  { value: '2000000', label: '2 USDC', inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', approxSOL: 0.014, cost: 2 },
  { value: '5000000', label: '5 USDC', inputMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', approxSOL: 0.035, cost: 5 }
];

export function SolRefuel({ className }: { className?: string }) {
  const { 
    networkMode, 
    isActionInProgress, 
    setIsActionInProgress,
    devnetSolBalance,
    setDevnetSolBalance,
    devnetUsdcBalance,
    setDevnetUsdcBalance
  } = useContext(AppContext);
  const { connection } = useConnection();
  const wallet = useWallet();
  const { connected, publicKey } = wallet;
  const { toast } = useToast();
  
  const [solBalance, setSolBalance] = useState<number | null>(null);
  const [isFetchingBalance, setIsFetchingBalance] = useState(false);
  const [selectedRefuelOption, setSelectedRefuelOption] = useState(REFUEL_OPTIONS[1].value);

  const isMainnet = networkMode === 'mainnet-beta';

  const selectedOption = useMemo(() => REFUEL_OPTIONS.find(o => o.value === selectedRefuelOption)!, [selectedRefuelOption]);

  const needsRefuel = useMemo(() => {
    if (!isMainnet) return true; // Always allow refueling on devnet for testing
    return solBalance !== null && solBalance < LOW_SOL_THRESHOLD;
  }, [solBalance, isMainnet]);
  
  const isActionDisabled = (isMainnet && !connected) || !needsRefuel || isActionInProgress || (!isMainnet && selectedOption.cost > devnetUsdcBalance);


  const fetchSolBalance = useCallback(async () => {
    if (!isMainnet || !connected || !publicKey) {
      setSolBalance(null);
      return;
    }
    setIsFetchingBalance(true);
    try {
      const balance = await connection.getBalance(publicKey);
      setSolBalance(balance);
    } catch (error) {
      console.error("Failed to fetch SOL balance:", error);
      setSolBalance(null);
    } finally {
      setIsFetchingBalance(false);
    }
  }, [isMainnet, connected, publicKey, connection]);

  useEffect(() => {
    if (isMainnet) {
      fetchSolBalance();
    }
  }, [isMainnet, fetchSolBalance]);

  useEffect(() => {
    return () => {
      setIsActionInProgress(false);
    };
  }, [setIsActionInProgress]);

  const handleRefuel = async () => {
    if (isActionDisabled) return;

    setIsActionInProgress(true);

    if (!isMainnet) {
      // Devnet simulation
      setTimeout(() => {
        setIsActionInProgress(false);
        setDevnetSolBalance(prev => prev + (selectedOption.approxSOL * LAMPORTS_PER_SOL));
        setDevnetUsdcBalance(prev => prev - selectedOption.cost);
        toast({
          title: "Refuel Successful! (Testnet)",
          description: `Your SOL balance has been topped up by ~${selectedOption.approxSOL.toFixed(3)} SOL.`,
        });
      }, 1500);
      return;
    }

    // Mainnet Logic
    if (!publicKey) {
       toast({ title: "Wallet not connected", variant: "destructive" });
       setIsActionInProgress(false);
       return;
    }
    try {
        const tx = await getSwapTransaction({
            inputMint: selectedOption.inputMint,
            outputMint: 'So11111111111111111111111111111111111111112', // Native SOL
            amount: selectedOption.value,
            userPublicKey: publicKey.toBase58(),
            networkMode: 'mainnet-beta'
        });

        const signedTx = await signTransaction(tx, wallet);
        const signature = await executeTransaction(signedTx, 'mainnet-beta');

        toast({
            title: "Refuel Successful!",
            description: `Swapped ${selectedOption.label} for SOL.`,
            action: (
              <a href={getExplorerUrl(signature, networkMode)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm">View Tx</Button>
              </a>
            )
        });

        // Re-fetch balance after a short delay
        setTimeout(fetchSolBalance, 5000);

    } catch (error) {
        console.error("Refuel failed:", error);
        toast({
            title: "Refuel Failed",
            description: (error as Error).message || "The transaction was not confirmed.",
            variant: "destructive",
        });
    } finally {
        setIsActionInProgress(false);
    }
  };

  const displayBalance = useMemo(() => {
    if (isMainnet) {
        if (isFetchingBalance) return <Skeleton className="h-8 w-32" />;
        if (solBalance === null) return "N/A";
        return `${(solBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`;
    }
    return `${(devnetSolBalance / LAMPORTS_PER_SOL).toFixed(4)} SOL`;
  }, [solBalance, isFetchingBalance, isMainnet, devnetSolBalance]);

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
            Running low? Swap other tokens for SOL to pay for gas fees. 
            {!isMainnet && `(Testnet USDC Balance: $${devnetUsdcBalance.toFixed(2)})`}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md">
            <Info className="w-4 h-4" />
            <p>You are in <span className="font-bold">{networkMode === 'devnet' ? 'Testnet Mode' : 'Mainnet Mode'}</span>. {networkMode === 'devnet' && 'Actions are simulated.'}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-secondary/50 text-center">
              <p className="text-sm text-muted-foreground">Your SOL Balance</p>
              <div className="text-2xl font-bold font-mono h-8 flex items-center justify-center">
                 {displayBalance}
              </div>
          </div>

          {!isFetchingBalance && isMainnet && !needsRefuel && connected && (
            <div className="text-center text-emerald-500 font-medium">Your SOL balance looks healthy!</div>
          )}
          {!isMainnet && selectedOption.cost > devnetUsdcBalance && (
            <div className="text-center text-destructive font-medium">Insufficient USDC for this option.</div>
          )}

          <div className="space-y-2">
            <Label htmlFor="refuel-amount">Refuel Amount</Label>
            <Select value={selectedRefuelOption} onValueChange={setSelectedRefuelOption} disabled={isActionInProgress}>
              <SelectTrigger id="refuel-amount">
                <SelectValue placeholder="Select amount to spend" />
              </SelectTrigger>
              <SelectContent>
                {REFUEL_OPTIONS.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    Pay with {option.label} (get ~{option.approxSOL.toFixed(3)} SOL)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={isActionDisabled} onClick={handleRefuel}>
            {isActionInProgress ? <Loader2 className="animate-spin" /> : <Droplets />}
            {isActionInProgress ? 'Refueling...' : 'Refuel Now'}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
