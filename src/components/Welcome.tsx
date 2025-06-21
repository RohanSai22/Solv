"use client";

import { useContext } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Icons } from "./icons";
import { AppContext, type AppView } from "@/contexts/AppContext";
import { Sparkles, Droplets, ShieldAlert, ListOrdered, CalendarClock, Star } from "lucide-react";

const features: {
  view: AppView;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    view: "dust-sweeper",
    title: "Dust Sweeper",
    description: "Consolidate small token balances.",
    icon: Sparkles,
  },
  {
    view: "sol-refuel",
    title: "SOL Refuel",
    description: "Swap tokens for SOL gas fees.",
    icon: Droplets,
  },
  {
    view: "spam-shield",
    title: "Spam Shield",
    description: "Burn spam NFTs and tokens.",
    icon: ShieldAlert,
  },
  {
    view: "limit-order",
    title: "Limit Orders",
    description: "Place orders at specific prices.",
    icon: ListOrdered,
  },
  {
    view: "dca-wizard",
    title: "DCA Wizard",
    description: "Automate recurring buys.",
    icon: CalendarClock,
  },
  {
    view: "pro-trader",
    title: "Pro Trader",
    description: "Advanced trading tools.",
    icon: Star,
  },
];


export function Welcome({ className }: { className?: string }) {
  const { setActiveView } = useContext(AppContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <div className="w-full max-w-4xl text-center mx-auto">
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit mb-4">
            <Icons.logo className="h-16 w-16 text-primary" />
          </div>
          <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tighter">Welcome to Solv</h1>
          <p className="text-muted-foreground text-lg mt-2 mb-8">Your all-in-one Wallet Health Hub for Solana and beyond.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-left">
            {features.map((feature) => (
              <Card 
                key={feature.view} 
                className="hover:border-primary/80 hover:shadow-lg hover:shadow-primary/10 transition-all cursor-pointer transform hover:-translate-y-1"
                onClick={() => setActiveView(feature.view)}
              >
                <CardHeader className="flex-row items-center gap-4 space-y-0">
                   <div className="p-2 bg-accent/20 rounded-lg">
                      <feature.icon className="w-6 h-6 text-primary" />
                   </div>
                   <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
      </div>
    </motion.div>
  )
}
