"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ListOrdered, Loader2, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useContext, useState, useEffect } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { getJupiterApiUrl } from "@/lib/jupiter-utils";

type Order = {
  id: string;
  pair: string;
  type: "Buy" | "Sell";
  price: string;
  amount: string;
  filled: string;
};

const initialOrders: Order[] = [
  { id: "1", pair: "SOL/USDC", type: "Buy", price: "145.50", amount: "10.0", filled: "20%" },
  { id: "2", pair: "JUP/USDC", type: "Sell", price: "1.25", amount: "500.0", filled: "0%" },
  { id: "3", pair: "BONK/SOL", type: "Buy", price: "0.000028", amount: "1,000,000", filled: "100%" },
];

export function LimitOrder({ className }: { className?: string }) {
  const { networkMode, isActionInProgress, setIsActionInProgress } = useContext(AppContext);
  const { connected } = useWallet();
  const { toast } = useToast();
  
  const [orders, setOrders] = useState<Order[]>(initialOrders);

  const isMainnet = networkMode === 'mainnet-beta';
  const isActionDisabled = (isMainnet && !connected) || isActionInProgress;

  useEffect(() => {
    return () => {
      setIsActionInProgress(false);
    };
  }, [setIsActionInProgress]);

  const handleCreateOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (isMainnet) {
       if (!connected) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet to create an order on Mainnet.",
          variant: "destructive",
        });
        return;
      }
      console.log("Preparing to create order on Mainnet using Jupiter API:", getJupiterApiUrl(networkMode));
      toast({
        title: "Mainnet Action",
        description: "Limit orders on Mainnet are not yet implemented.",
      });

    } else {
      setIsActionInProgress(true);
      setTimeout(() => {
        const newOrder: Order = {
          id: (Math.random() * 1000).toString(),
          pair: "NEW/USDC",
          type: "Buy",
          price: "100.00",
          amount: "1.0",
          filled: "0%",
        };
        setOrders(prev => [newOrder, ...prev]);
        setIsActionInProgress(false);
        toast({
          title: "Order Created (Testnet)",
          description: "Your new limit order has been placed.",
        });
      }, 1500);
    }
  };

  const handleCancelOrder = (orderId: string) => {
    if (isMainnet) {
      if (!connected) {
        toast({
          title: "Connect Wallet",
          description: "Please connect your wallet to cancel an order on Mainnet.",
          variant: "destructive",
        });
        return;
      }
      console.log("Preparing to cancel order on Mainnet using Jupiter API:", getJupiterApiUrl(networkMode));
      toast({
        title: "Mainnet Action",
        description: "Cancelling orders on Mainnet is not yet implemented.",
      });
    } else {
      setOrders(prev => prev.filter(order => order.id !== orderId));
      toast({
        title: "Order Cancelled (Testnet)",
        description: "Your limit order has been successfully cancelled.",
        variant: "destructive"
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
      <Card className={cn("flex flex-col w-full max-w-4xl", className)}>
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-accent" />
            Limit-Order Desk
          </CardTitle>
          <CardDescription>
            Create and manage your limit orders.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md mb-4">
            <Info className="w-4 h-4" />
            <p>You are in <span className="font-bold">{networkMode === 'devnet' ? 'Testnet Mode' : 'Mainnet Mode'}</span>. {networkMode === 'devnet' && 'Actions are simulated.'}</p>
          </div>
          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Order</TabsTrigger>
              <TabsTrigger value="manage">Manage Orders</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="mt-4">
              <form onSubmit={handleCreateOrder}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="sell-token">You sell</Label>
                      <Input id="sell-token" placeholder="Token" disabled={isActionDisabled} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buy-token">You buy</Label>
                      <Input id="buy-token" placeholder="Token" disabled={isActionDisabled}/>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="limit-price">Limit price</Label>
                    <Input id="limit-price" placeholder="Price" type="number" disabled={isActionDisabled}/>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" placeholder="Amount to trade" type="number" disabled={isActionDisabled}/>
                  </div>
                  <Button type="submit" className="w-full" disabled={isActionDisabled}>
                    {isActionInProgress && <Loader2 className="animate-spin" />}
                    {isActionInProgress ? "Creating Order..." : "Create Limit Order"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="manage" className="mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pair</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Filled</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.pair}</TableCell>
                      <TableCell>
                        <Badge variant={order.type === 'Buy' ? 'default' : 'destructive'} className={cn(
                          'text-white',
                          order.type === 'Buy' ? 'bg-emerald-600' : 'bg-red-600'
                        )}>{order.type}</Badge>
                      </TableCell>
                      <TableCell>{order.price}</TableCell>
                      <TableCell>{order.amount}</TableCell>
                      <TableCell>{order.filled}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="destructive" size="sm" onClick={() => handleCancelOrder(order.id)} disabled={order.filled === '100%' || (isMainnet && !connected)}>
                          Cancel
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
