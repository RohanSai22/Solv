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
import { Flame, ShieldAlert } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useContext } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";

const spamTokens = [
  { name: "FREESOL.io", icon: "https://placehold.co/32x32.png" },
  { name: "ClaimWen.com", icon: "https://placehold.co/32x32.png" },
  { name: "1000XGEM.xyz", icon: "https://placehold.co/32x32.png" },
  { name: "USDC-Airdrop.net", icon: "https://placehold.co/32x32.png" },
  { name: "SolanaGiveaway.org", icon: "https://placehold.co/32x32.png" },
];

export function SpamShield({ className }: { className?: string }) {
  const { networkMode } = useContext(AppContext);
  const { connected } = useWallet();
  const isActionDisabled = networkMode === 'mainnet-beta' && !connected;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="flex flex-col w-full max-w-md">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-primary" />
            Spam-Burn Shield
          </CardTitle>
          <CardDescription>
            Identify and burn unverified spam tokens.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <p className="text-sm text-muted-foreground">
            Found {spamTokens.length} potential spam tokens.
          </p>
          <ScrollArea className="h-40 w-full pr-4">
            <div className="space-y-1">
              {spamTokens.map((token) => (
                <div
                  key={token.name}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-secondary/50"
                >
                  <Checkbox id={token.name} disabled={isActionDisabled}/>
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
        </CardContent>
        <CardFooter>
          <Button variant="destructive" className="w-full" disabled={isActionDisabled}>
            <Flame className="w-4 h-4 mr-2" />
            Burn Selected Spam
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
