"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Icons } from "./icons";

export function Welcome({ className }: { className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="w-full max-w-lg text-center">
        <CardHeader>
          <div className="mx-auto bg-primary/10 p-4 rounded-full w-fit">
            <Icons.logo className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="font-headline text-3xl mt-4">Welcome to Solv</CardTitle>
          <CardDescription>Your all-in-one Wallet Health Hub for Solana.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Select a feature from the header to get started. You can switch between Testnet for simulations and Mainnet for real transactions.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  )
}
