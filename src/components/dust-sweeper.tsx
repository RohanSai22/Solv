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
import { Sparkles, Loader2, Info } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { getJupiterApiUrl } from "@/lib/jupiter-utils";

const initialDustTokens = [
  {
    name: "LOWB",
    amount: "0.0012",
    icon: "https://placehold.co/32x32.png",
  },
  {
    name: "TINY",
    amount: "0.0005",
    icon: "https://placehold.co/32x32.png",
  },
  {
    name: "屑",
    amount: "1.53",
    icon: "https://placehold.co/32x32.png",
  },
  {
    name: "PEANUT",
    amount: "10.2",
    icon: "https://placehold.co/32x32.png",
  },
];

export function DustSweeper({ className }: { className?: string }) {
  const { networkMode, isActionInProgress, setIsActionInProgress } = useContext(AppContext);
  const { connected } = useWallet();
  const { toast } = useToast();
  const [dustTokens, setDustTokens] = useState(initialDustTokens);
  
  const isMainnet = networkMode === 'mainnet-beta';
  const isActionDisabled = (isMainnet && !connected) || isActionInProgress || dustTokens.length === 0;

  useEffect(() => {
    return () => {
      setIsActionInProgress(false);
    };
  }, [setIsActionInProgress]);

  const handleSweep = () => {
    if (isMainnet) {
      if (!connected) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet to sweep dust on Mainnet.",
          variant: "destructive",
        });
        return;
      }
      // Mainnet logic would go here
      console.log("Preparing to sweep on Mainnet using Jupiter API:", getJupiterApiUrl(networkMode));
      toast({
          title: "Mainnet Action",
          description: "Sweeping on Mainnet is not yet implemented.",
      });
    } else {
      // Devnet simulation
      setIsActionInProgress(true);
      setTimeout(() => {
        const sweptCount = dustTokens.length;
        setDustTokens([]);
        setIsActionInProgress(false);
        toast({
          title: "Dust Swept! (Testnet)",
          description: `You successfully converted ${sweptCount} tokens and earned 0.05 SOL.`,
        });
      }, 2000);
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
            <Sparkles className="w-6 h-6 text-accent" />
            Dust Sweeper
          </CardTitle>
          <CardDescription>
            Convert small balance tokens into something useful.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md">
            <Info className="w-4 h-4" />
            <p>You are in <span className="font-bold">{networkMode === 'devnet' ? 'Testnet Mode' : 'Mainnet Mode'}</span>. {networkMode === 'devnet' && 'Actions are simulated.'}</p>
          </div>
          {dustTokens.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Found {dustTokens.length} dust tokens in your wallet.
              </p>
              <ScrollArea className="h-48 w-full pr-4">
                <div className="space-y-3">
                  {dustTokens.map((token) => (
                    <div key={token.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Image
                          src={token.icon}
                          alt={`${token.name} icon`}
                          width={32}
                          height={32}
                          className="rounded-full"
                          data-ai-hint="crypto token"
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
            <div className="flex items-center justify-center h-48 text-muted-foreground">
              <p>No dust tokens found!</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex-col sm:flex-row gap-2">
          <Select defaultValue="jup" disabled={isActionDisabled}>
            <SelectTrigger>
              <SelectValue placeholder="Convert to" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="jup">Jupiter (JUP)</SelectItem>
              <SelectItem value="sol">Solana (SOL)</SelectItem>
              <SelectItem value="usdc">USDC</SelectItem>
            </SelectContent>
          </Select>
          <Button className="w-full sm:w-auto" disabled={isActionDisabled} onClick={handleSweep}>
            {isActionInProgress ? <Loader2 className="animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isActionInProgress ? "Sweeping..." : "Sweep All"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
