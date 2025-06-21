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
import { Sparkles, Loader2 } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";

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
  const { networkMode } = useContext(AppContext);
  const { connected } = useWallet();
  const { toast } = useToast();
  const [dustTokens, setDustTokens] = useState(initialDustTokens);
  const [isSweeping, setIsSweeping] = useState(false);

  const isActionDisabled = (networkMode === 'mainnet-beta' && !connected) || isSweeping || dustTokens.length === 0;

  const handleSweep = () => {
    if (networkMode === 'devnet') {
      setIsSweeping(true);
      setTimeout(() => {
        const sweptCount = dustTokens.length;
        setDustTokens([]);
        setIsSweeping(false);
        toast({
          title: "Dust Swept!",
          description: `You successfully converted ${sweptCount} tokens and earned 0.05 SOL.`,
        });
      }, 2000);
    } else {
      // Mainnet logic would go here
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to sweep dust on Mainnet.",
        variant: "destructive",
      });
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
      <Card className="flex flex-col w-full max-w-xl">
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
          {dustTokens.length > 0 ? (
            <>
              <p className="text-sm text-muted-foreground">
                Found {dustTokens.length} dust tokens in your wallet.
              </p>
              <ScrollArea className="h-40 w-full pr-4">
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
            <div className="flex items-center justify-center h-40 text-muted-foreground">
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
            {isSweeping ? <Loader2 className="animate-spin" /> : <Sparkles className="w-4 h-4" />}
            {isSweeping ? "Sweeping..." : "Sweep All"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
