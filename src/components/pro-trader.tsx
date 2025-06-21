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
import { Star, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useContext } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";

export function ProTrader({ className }: { className?: string }) {
  const { networkMode } = useContext(AppContext);
  const { connected } = useWallet();
  const { toast } = useToast();
  const isActionDisabled = networkMode === 'mainnet-beta' && !connected;

  const handleUpgrade = () => {
    toast({
      title: "Coming Soon!",
      description: "Pro Trader features are under development. Stay tuned!",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="flex flex-col w-full max-w-xl border-2 border-amber-400 shadow-amber-400/20 shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2 text-amber-400">
            <Star className="w-6 h-6" />
            Pro Auto-Trader
          </CardTitle>
          <CardDescription>
            Unlock automated trading and advanced analytics.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Automated trading strategies</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Real-time profit & loss tracking</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Telegram integration for alerts</span>
            </li>
            <li className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span>Priority support</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-amber-400 hover:bg-amber-500 text-black" disabled={isActionDisabled} onClick={handleUpgrade}>
            <Star className="w-4 h-4 mr-2" />
            Upgrade to Pro
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
