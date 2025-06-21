
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
import { Badge } from "@/components/ui/badge";
import { Star, Zap, LineChart, Layers, GitPullRequest, SlidersHorizontal, PackageOpen } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

export function ProTrader({ className }: { className?: string }) {
  const { toast } = useToast();

  const handleNotify = () => {
    toast({
      title: "Coming Soon!",
      description: "Advanced trading features are under development. Stay tuned for updates!",
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
      <Card className="flex flex-col w-full max-w-6xl border-2 border-amber-400 shadow-amber-400/20 shadow-lg">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="font-headline flex items-center gap-2 text-amber-400">
                <Star className="w-6 h-6" />
                Pro Trader
              </CardTitle>
              <CardDescription>
                Unlock institutional-grade tools for advanced trading strategies.
              </CardDescription>
            </div>
            <Badge variant="outline" className="border-amber-400 text-amber-400">Coming Soon</Badge>
          </div>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><LineChart className="w-5 h-5" /> Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
              <Card>
                 <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2"><PackageOpen className="w-5 h-5" /> Open Orders & History</CardTitle>
                </CardHeader>
                <CardContent>
                   <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card>
                 <CardHeader>
                  <CardTitle className="text-lg">Order Form</CardTitle>
                </CardHeader>
                <CardContent>
                  <Tabs defaultValue="market">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="market">Market</TabsTrigger>
                      <TabsTrigger value="ladder">Ladder</TabsTrigger>
                      <TabsTrigger value="oco">OCO</TabsTrigger>
                    </TabsList>
                    <TabsContent value="market" className="mt-4 space-y-4">
                        <div>
                          <Label htmlFor="price">Price (USDC)</Label>
                          <Input id="price" disabled placeholder="Market" />
                        </div>
                        <div>
                          <Label htmlFor="amount">Amount (SOL)</Label>
                          <Input id="amount" disabled placeholder="0.00" />
                        </div>
                         <Button className="w-full" disabled>Buy SOL</Button>
                    </TabsContent>
                     <TabsContent value="ladder" className="mt-4 flex items-center justify-center h-32 text-muted-foreground">
                        <Layers className="w-8 h-8" />
                     </TabsContent>
                      <TabsContent value="oco" className="mt-4 flex items-center justify-center h-32 text-muted-foreground">
                        <GitPullRequest className="w-8 h-8" />
                     </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full bg-amber-400 hover:bg-amber-500 text-black" onClick={handleNotify}>
            <Zap className="w-4 h-4 mr-2" />
            Notify Me When Available
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
