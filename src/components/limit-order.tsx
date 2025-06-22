
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
import { ListOrdered, Loader2, Info, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useContext, useState, useEffect, useCallback } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import {
  createTriggerOrder,
  executeTriggerOrder,
  getTriggerOrders,
  cancelTriggerOrder,
  type TriggerOrder,
  type TriggerOrderParams,
} from "@/lib/jupiter-utils";
import { VersionedTransaction } from "@solana/web3.js";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";

const SOL_MINT = 'So11111111111111111111111111111111111111112';
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const JUP_MINT = 'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN';
const MINT_DECIMALS: Record<string, number> = {
  [SOL_MINT]: 9,
  [USDC_MINT]: 6,
  [JUP_MINT]: 6
};

export function LimitOrder({ className }: { className?: string }) {
  const { 
    networkMode, 
    isActionInProgress, 
    setIsActionInProgress,
    limitOrders,
    setLimitOrders,
  } = useContext(AppContext);
  const wallet = useWallet();
  const { connected, publicKey, signTransaction } = wallet;
  const { toast } = useToast();

  const [isFetching, setIsFetching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  // Form State
  const [inputMint, setInputMint] = useState(SOL_MINT);
  const [outputMint, setOutputMint] = useState(USDC_MINT);
  const [makingAmount, setMakingAmount] = useState('1'); // Amount user sells
  const [takingAmount, setTakingAmount] = useState('150'); // Amount user wants to get

  const isMainnet = networkMode === 'mainnet-beta';
  const isFormDisabled = (isMainnet && !connected) || isCreating || !!isCancelling;

  const fetchOrders = useCallback(async () => {
    if (!isMainnet) return; // Testnet is handled by context
    if (!connected || !publicKey) {
      setLimitOrders([]);
      return;
    }
    setIsFetching(true);
    try {
      const fetchedOrders = await getTriggerOrders(publicKey, networkMode);
      setLimitOrders(fetchedOrders);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to fetch orders', description: (error as Error).message });
    } finally {
      setIsFetching(false);
    }
  }, [isMainnet, connected, publicKey, networkMode, toast, setLimitOrders]);

  useEffect(() => {
    if (isMainnet && connected) {
      fetchOrders();
      const interval = setInterval(fetchOrders, 15000);
      return () => clearInterval(interval);
    }
  }, [isMainnet, connected, fetchOrders]);


  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormDisabled) return;

    setIsCreating(true);
    setIsActionInProgress(true);

    const makingAmountLamports = (parseFloat(makingAmount) * Math.pow(10, MINT_DECIMALS[inputMint])).toString();
    const takingAmountLamports = (parseFloat(takingAmount) * Math.pow(10, MINT_DECIMALS[outputMint])).toString();

    if (!isMainnet) {
      // Devnet Simulation
      const newOrder: TriggerOrder = {
        id: new Date().toISOString(),
        maker: 'simulated-user',
        inputMint,
        outputMint,
        makingAmount: makingAmountLamports,
        takingAmount: takingAmountLamports,
        status: 'OPEN',
      };
      setLimitOrders(prev => [newOrder, ...prev]);
      toast({ title: 'Order Created (Testnet)', description: 'Your new limit order has been saved for this session.' });
      setIsCreating(false);
      setIsActionInProgress(false);
      return;
    }

    // Mainnet Logic
    if (!publicKey || !signTransaction) {
      toast({ variant: 'destructive', title: 'Wallet Not Connected' });
      setIsCreating(false);
      setIsActionInProgress(false);
      return;
    }
    try {
      const orderParams: TriggerOrderParams = {
        maker: publicKey,
        inputMint,
        outputMint,
        makingAmount: makingAmountLamports,
        takingAmount: takingAmountLamports,
      };

      const { requestId, transaction: txBase64 } = await createTriggerOrder(orderParams, networkMode);
      const transaction = VersionedTransaction.deserialize(Buffer.from(txBase64, 'base64'));
      const signedTransaction = await signTransaction(transaction);
      
      await executeTriggerOrder({ requestId, signedTransaction }, networkMode);
      
      toast({ title: 'Limit Order Created!', description: 'Your order is now active on-chain.' });
      await fetchOrders();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Order Creation Failed', description: (error as Error).message });
    } finally {
      setIsCreating(false);
      setIsActionInProgress(false);
    }
  };

  const handleCancelOrder = async (order: TriggerOrder) => {
    if (isCancelling || isActionInProgress) return;

    setIsCancelling(order.id);
    setIsActionInProgress(true);

    if (!isMainnet) {
      // Devnet Simulation
      setLimitOrders(prev => prev.filter(o => o.id !== order.id));
      toast({ title: 'Order Cancelled (Testnet)', variant: 'destructive' });
      setIsCancelling(null);
      setIsActionInProgress(false);
      return;
    }

    // Mainnet Logic
    if (!publicKey || !signTransaction) {
        toast({ variant: 'destructive', title: 'Wallet Not Connected' });
        setIsCancelling(null);
        setIsActionInProgress(false);
        return;
    }
    try {
      const { transaction: txBase64, requestId } = await cancelTriggerOrder({ orderId: order.id, maker: publicKey }, networkMode);
      const transaction = VersionedTransaction.deserialize(Buffer.from(txBase64, 'base64'));
      const signedTransaction = await signTransaction(transaction);

      await executeTriggerOrder({ requestId, signedTransaction }, networkMode);
      
      toast({ title: 'Order Cancelled', description: 'Your limit order has been cancelled.' });
      await fetchOrders();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Cancellation Failed', description: (error as Error).message });
    } finally {
      setIsCancelling(null);
      setIsActionInProgress(false);
    }
  };

  const getTokenSymbol = (mint: string) => {
    if (mint === SOL_MINT) return 'SOL';
    if (mint === USDC_MINT) return 'USDC';
    if (mint === JUP_MINT) return 'JUP';
    return mint.slice(0, 4) + '...';
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="flex flex-col w-full max-w-4xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <ListOrdered className="w-6 h-6 text-accent" />
            Limit-Order Desk
          </CardTitle>
          <CardDescription>
            Create and manage your limit orders. Jupiter's Trigger API is used for this feature.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md mb-4">
            <Info className="w-4 h-4" />
            <p>You are in <span className="font-bold">{isMainnet ? 'Mainnet Mode' : 'Testnet Mode'}</span>. {isMainnet ? 'Actions are live.' : 'Actions are simulated.'}</p>
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
                       <Select value={inputMint} onValueChange={setInputMint} disabled={isFormDisabled}>
                        <SelectTrigger id="sell-token"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SOL_MINT}>SOL</SelectItem>
                          <SelectItem value={USDC_MINT}>USDC</SelectItem>
                          <SelectItem value={JUP_MINT}>JUP</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input id="sell-amount" value={makingAmount} onChange={e => setMakingAmount(e.target.value)} placeholder="Amount to sell" type="number" disabled={isFormDisabled} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buy-token">You buy</Label>
                       <Select value={outputMint} onValueChange={setOutputMint} disabled={isFormDisabled}>
                        <SelectTrigger id="buy-token"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SOL_MINT}>SOL</SelectItem>
                          <SelectItem value={USDC_MINT}>USDC</SelectItem>
                          <SelectItem value={JUP_MINT}>JUP</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input id="buy-amount" value={takingAmount} onChange={e => setTakingAmount(e.target.value)} placeholder="Amount to buy" type="number" disabled={isFormDisabled} />
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground text-center p-2 bg-secondary/50 rounded-md">
                     Limit Price: {(parseFloat(takingAmount) / parseFloat(makingAmount) || 0).toFixed(6)} {getTokenSymbol(outputMint)} per {getTokenSymbol(inputMint)}
                  </div>
                  <Button type="submit" className="w-full" disabled={isFormDisabled}>
                    {isCreating ? <Loader2 className="animate-spin" /> : null}
                    {isCreating ? "Creating Order..." : "Create Limit Order"}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="manage" className="mt-4">
              {isFetching && isMainnet ? <Skeleton className="h-40 w-full" /> : limitOrders.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pair</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Limit Price</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {limitOrders.map((order) => {
                      const makingDecimals = MINT_DECIMALS[order.inputMint] ?? 6;
                      const takingDecimals = MINT_DECIMALS[order.outputMint] ?? 6;
                      const makingAmountUi = parseFloat(order.makingAmount) / Math.pow(10, makingDecimals);
                      const takingAmountUi = parseFloat(order.takingAmount) / Math.pow(10, takingDecimals);
                      const price = takingAmountUi / makingAmountUi;
                      
                      return (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">{getTokenSymbol(order.inputMint)}/{getTokenSymbol(order.outputMint)}</TableCell>
                        <TableCell>
                          <Badge variant={order.inputMint === USDC_MINT ? 'destructive' : 'default'} className={order.inputMint === USDC_MINT ? 'bg-red-600' : 'bg-emerald-600'}>
                            {order.inputMint === USDC_MINT ? "Sell" : "Buy"}
                          </Badge>
                        </TableCell>
                        <TableCell>{makingAmountUi.toFixed(4)} {getTokenSymbol(order.inputMint)}</TableCell>
                        <TableCell>{price.toFixed(6)}</TableCell>
                        <TableCell><Badge variant="outline">{order.status}</Badge></TableCell>
                        <TableCell className="text-right">
                          {order.status === 'OPEN' && (
                            <Button variant="ghost" size="icon" onClick={() => handleCancelOrder(order)} disabled={!!isCancelling}>
                              {isCancelling === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    )})}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  {!isMainnet ? "Create a simulated order to see it here." : !connected ? "Connect your wallet to manage orders." : "You have no limit orders."}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  );
}
