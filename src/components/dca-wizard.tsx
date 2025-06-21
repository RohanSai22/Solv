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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarClock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useContext, useState } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";

export function DcaWizard({ className }: { className?: string }) {
  const { networkMode } = useContext(AppContext);
  const { connected } = useWallet();
  const { toast } = useToast();
  const [isScheduling, setIsScheduling] = useState(false);
  const isActionDisabled = (networkMode === 'mainnet-beta' && !connected) || isScheduling;

  const handleScheduleDca = () => {
    if (networkMode === 'devnet') {
      setIsScheduling(true);
      setTimeout(() => {
        setIsScheduling(false);
        toast({
          title: "DCA Scheduled",
          description: "Your new dollar-cost averaging schedule has been successfully created.",
        });
      }, 1500);
    } else {
      // Mainnet logic would go here
      toast({
        title: "Connect Wallet",
        description: "Please connect your wallet to schedule a DCA on Mainnet.",
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
      <Card className="flex flex-col w-full max-w-lg">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-accent" />
            DCA Wizard
          </CardTitle>
          <CardDescription>
            Schedule and manage dollar-cost averaging strategies.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="space-y-2">
            <Label htmlFor="spend-amount">Amount to spend</Label>
            <Input id="spend-amount" placeholder="e.g., 100" type="number" disabled={isActionDisabled} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="spend-token">Spend Token</Label>
            <Select disabled={isActionDisabled}>
              <SelectTrigger id="spend-token">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="usdc">USDC</SelectItem>
                <SelectItem value="sol">SOL</SelectItem>
                <SelectItem value="jup">JUP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="buy-token">Buy Token</Label>
            <Select disabled={isActionDisabled}>
              <SelectTrigger id="buy-token">
                <SelectValue placeholder="Select token" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sol">SOL</SelectItem>
                <SelectItem value="jup">JUP</SelectItem>
                <SelectItem value="bonk">BONK</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="frequency">Frequency</Label>
            <Select disabled={isActionDisabled}>
              <SelectTrigger id="frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" disabled={isActionDisabled} onClick={handleScheduleDca}>
            {isScheduling && <Loader2 className="animate-spin" />}
            {isScheduling ? "Scheduling..." : "Schedule DCA"}
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
