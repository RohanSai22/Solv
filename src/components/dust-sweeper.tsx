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
import { Sparkles } from "lucide-react";
import Image from "next/image";

const dustTokens = [
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

export function DustSweeper() {
  return (
    <Card className="flex flex-col">
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
      </CardContent>
      <CardFooter className="flex-col sm:flex-row gap-2">
        <Select defaultValue="jup">
          <SelectTrigger>
            <SelectValue placeholder="Convert to" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jup">Jupiter (JUP)</SelectItem>
            <SelectItem value="sol">Solana (SOL)</SelectItem>
            <SelectItem value="usdc">USDC</SelectItem>
          </SelectContent>
        </Select>
        <Button className="w-full sm:w-auto">
          <Sparkles className="w-4 h-4 mr-2" />
          Sweep All
        </Button>
      </CardFooter>
    </Card>
  );
}
