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
import { Droplets } from "lucide-react";

export function SolRefuel() {
  return (
    <Card className="flex flex-col">
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
        <div className="p-4 rounded-lg bg-secondary/50 text-center">
            <p className="text-sm text-muted-foreground">Your SOL Balance</p>
            <p className="text-2xl font-bold font-mono">0.0051 SOL</p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="refuel-amount">Get SOL Amount</Label>
          <Select defaultValue="0.02">
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
          <Select defaultValue="usdc">
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
        <Button className="w-full">
          Refuel Now
        </Button>
      </CardFooter>
    </Card>
  );
}
