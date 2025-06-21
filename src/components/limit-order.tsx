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
import { ListOrdered } from "lucide-react";
import { cn } from "@/lib/utils";

const orders = [
  { pair: "SOL/USDC", type: "Buy", price: "145.50", amount: "10.0", filled: "20%" },
  { pair: "JUP/USDC", type: "Sell", price: "1.25", amount: "500.0", filled: "0%" },
  { pair: "BONK/SOL", type: "Buy", price: "0.000028", amount: "1,000,000", filled: "100%" },
];

export function LimitOrder({ className }: { className?: string }) {
  return (
    <Card className={cn("flex flex-col", className)}>
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
        <Tabs defaultValue="create">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Order</TabsTrigger>
            <TabsTrigger value="manage">Manage Orders</TabsTrigger>
          </TabsList>
          <TabsContent value="create" className="mt-4">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sell-token">You sell</Label>
                  <Input id="sell-token" placeholder="Token" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buy-token">You buy</Label>
                  <Input id="buy-token" placeholder="Token" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="limit-price">Limit price</Label>
                <Input id="limit-price" placeholder="Price" type="number" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input id="amount" placeholder="Amount to trade" type="number" />
              </div>
              <Button className="w-full">
                Create Limit Order
              </Button>
            </div>
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
                  <TableRow key={order.pair + order.price}>
                    <TableCell className="font-medium">{order.pair}</TableCell>
                    <TableCell>
                      <Badge variant={order.type === 'Buy' ? 'default' : 'secondary'} className={order.type === 'Buy' ? 'bg-green-600' : 'bg-red-600'}>{order.type}</Badge>
                    </TableCell>
                    <TableCell>{order.price}</TableCell>
                    <TableCell>{order.amount}</TableCell>
                    <TableCell>{order.filled}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="destructive" size="sm" disabled={order.filled === '100%'}>
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
  );
}
