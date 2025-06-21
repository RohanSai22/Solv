
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarClock, Loader2, Info, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useContext, useEffect, useState, useCallback, useMemo } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { format, formatDistanceToNow, addDays } from "date-fns";
import { cn } from "@/lib/utils";
import {
  createRecurringOrder,
  executeRecurringOrder,
  getRecurringOrders,
  cancelRecurringOrder,
  type RecurringOrder,
  type RecurringOrderParams
} from "@/lib/jupiter-utils";
import { VersionedTransaction } from "@solana/web3.js";

const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v';
const USDC_DECIMALS = 6;
const SOL_MINT = 'So11111111111111111111111111111111111111112';

const Countdown = ({ to }: { to: Date }) => {
  const [distance, setDistance] = useState(formatDistanceToNow(to, { addSuffix: true }));

  useEffect(() => {
    const interval = setInterval(() => {
      setDistance(formatDistanceToNow(to, { addSuffix: true }));
    }, 1000);
    return () => clearInterval(interval);
  }, [to]);

  return <>{distance}</>;
};

export function DcaWizard({ className }: { className?: string }) {
  const { networkMode, isActionInProgress, setIsActionInProgress } = useContext(AppContext);
  const wallet = useWallet();
  const { connected, publicKey, signTransaction } = wallet;
  const { toast } = useToast();
  
  const [schedules, setSchedules] = useState<RecurringOrder[]>([]);
  const [isFetchingSchedules, setIsFetchingSchedules] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCancelling, setIsCancelling] = useState<string | null>(null);

  // Form state
  const [spendToken, setSpendToken] = useState(USDC_MINT);
  const [buyToken, setBuyToken] = useState(SOL_MINT);
  const [amount, setAmount] = useState('50');
  const [frequency, setFrequency] = useState<'DAY' | 'WEEK' | 'MONTH'>('WEEK');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [occurrences, setOccurrences] = useState('12');

  const isMainnet = networkMode === 'mainnet-beta';
  const isFormDisabled = (isMainnet && !connected) || isCreating || isCancelling !== null || isActionInProgress;

  const validationError = useMemo(() => {
    if (spendToken === USDC_MINT && parseFloat(amount) < 50) {
      return 'Minimum amount for USDC is $50.';
    }
    if (parseInt(occurrences, 10) < 2) {
      return 'Minimum number of payments is 2.';
    }
    return null;
  }, [spendToken, amount, occurrences]);

  const canCreate = !validationError;

  const fetchSchedules = useCallback(async () => {
    if (!isMainnet || !connected || !publicKey) {
      setSchedules([]); // On Devnet, start with an empty list
      return;
    }
    setIsFetchingSchedules(true);
    try {
      const fetchedSchedules = await getRecurringOrders(publicKey, networkMode);
      setSchedules(fetchedSchedules);
    } catch (error) {
      toast({ variant: 'destructive', title: 'Failed to fetch schedules', description: (error as Error).message });
    } finally {
      setIsFetchingSchedules(false);
    }
  }, [isMainnet, connected, publicKey, networkMode, toast]);

  useEffect(() => {
    if (isMainnet && connected) {
      fetchSchedules();
      const interval = setInterval(fetchSchedules, 15000); // Poll every 15 seconds
      return () => clearInterval(interval);
    } else {
      setSchedules([]);
    }
  }, [isMainnet, connected, fetchSchedules]);

  const handleScheduleDca = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate || isFormDisabled) return;

    setIsCreating(true);
    setIsActionInProgress(true);

    if (!isMainnet || !publicKey || !signTransaction) {
      // Devnet Simulation
      const newSchedule: RecurringOrder = {
        id: new Date().toISOString(),
        user: 'simulated-user',
        inputMint: spendToken,
        outputMint: buyToken,
        inAmount: (parseFloat(amount) * Math.pow(10, USDC_DECIMALS)).toString(),
        outAmount: '0',
        status: 'ACTIVE',
        nextExecutionTime: addDays(startDate!, 7).toISOString(),
        lastExecution: null,
        params: { type: 'time', interval: frequency, intervalValue: 1, startDate: Math.floor(startDate!.getTime() / 1000), maxNumberOfExecutions: parseInt(occurrences) }
      };
      setSchedules(prev => [newSchedule, ...prev]);
      toast({ title: 'DCA Scheduled (Simulated)', description: 'Your new recurring buy has been added.' });
      setIsCreating(false);
      setIsActionInProgress(false);
      return;
    }

    // Mainnet Logic
    try {
      const inAmountLamports = (parseFloat(amount) * Math.pow(10, USDC_DECIMALS)).toString();
      const dcaParams: RecurringOrderParams = {
        type: 'time',
        interval: frequency,
        intervalValue: 1,
        startDate: Math.floor(startDate!.getTime() / 1000),
        maxNumberOfExecutions: parseInt(occurrences, 10),
      };

      const { requestId, transaction: txBase64 } = await createRecurringOrder({
        user: publicKey,
        inputMint: spendToken,
        outputMint: buyToken,
        inAmount: inAmountLamports,
        params: dcaParams,
        networkMode,
      });

      const transaction = VersionedTransaction.deserialize(Buffer.from(txBase64, 'base64'));
      const signedTransaction = await signTransaction(transaction);

      await executeRecurringOrder({ requestId, signedTransaction, networkMode });
      
      toast({ title: 'DCA Scheduled!', description: 'Your recurring buy is now active on-chain.' });
      await fetchSchedules();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Scheduling Failed', description: (error as Error).message });
    } finally {
      setIsCreating(false);
      setIsActionInProgress(false);
    }
  };

  const handleCancelSchedule = async (requestId: string) => {
    if (isCancelling || isActionInProgress) return;

    setIsCancelling(requestId);
    setIsActionInProgress(true);

    if (!isMainnet || !publicKey) {
      // Devnet Simulation
      setSchedules(prev => prev.filter(s => s.id !== requestId));
      toast({ title: 'Schedule Cancelled (Simulated)', variant: 'destructive' });
      setIsCancelling(null);
      setIsActionInProgress(false);
      return;
    }

    // Mainnet Logic
    try {
      await cancelRecurringOrder({ requestId, user: publicKey, networkMode });
      toast({ title: 'Schedule Cancelled', description: 'Your recurring buy has been cancelled on-chain.' });
      await fetchSchedules();
    } catch (error) {
      toast({ variant: 'destructive', title: 'Cancellation Failed', description: (error as Error).message });
    } finally {
      setIsCancelling(null);
      setIsActionInProgress(false);
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
      <Card className="flex flex-col w-full max-w-4xl">
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
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md">
            <Info className="w-4 h-4" />
            <p>
              You are in <span className="font-bold">{isMainnet ? 'Mainnet Mode' : 'Testnet Mode'}</span>. 
              {isMainnet ? "Actions are live on-chain." : "Actions are simulated."}
            </p>
          </div>

          <Tabs defaultValue="create">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="create">Create Schedule</TabsTrigger>
              <TabsTrigger value="manage">Manage Schedules</TabsTrigger>
            </TabsList>
            <TabsContent value="create" className="mt-4">
              <form onSubmit={handleScheduleDca}>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="spend-token">You Spend</Label>
                      <Select value={spendToken} onValueChange={setSpendToken} disabled={isFormDisabled}>
                        <SelectTrigger id="spend-token">
                          <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={USDC_MINT}>USDC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buy-token">You Buy</Label>
                      <Select value={buyToken} onValueChange={setBuyToken} disabled={isFormDisabled}>
                        <SelectTrigger id="buy-token">
                          <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={SOL_MINT}>SOL</SelectItem>
                          <SelectItem value="JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN">JUP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spend-amount">Amount to spend each time (USDC)</Label>
                    <Input id="spend-amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 50" type="number" disabled={isFormDisabled} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="space-y-2">
                      <Label htmlFor="occurrences">Number of Payments</Label>
                      <Input id="occurrences" value={occurrences} onChange={e => setOccurrences(e.target.value)} placeholder="e.g., 12" type="number" disabled={isFormDisabled} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={frequency} onValueChange={(value) => setFrequency(value as any)} disabled={isFormDisabled}>
                        <SelectTrigger id="frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="DAY">Daily</SelectItem>
                          <SelectItem value="WEEK">Weekly</SelectItem>
                          <SelectItem value="MONTH">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                   <div className="space-y-2">
                       <Label htmlFor="start-date">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
                              disabled={isFormDisabled}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus disabled={(date) => date < new Date()}/>
                          </PopoverContent>
                        </Popover>
                    </div>
                    {validationError && <p className="text-sm text-destructive">{validationError}</p>}
                </div>
                <Button className="w-full mt-6" disabled={isFormDisabled || !canCreate} type="submit">
                  {isCreating && <Loader2 className="animate-spin" />}
                  {isCreating ? "Scheduling..." : "Schedule DCA"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="manage" className="mt-4">
               {isFetchingSchedules ? <Skeleton className="h-24 w-full" /> : schedules.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pair</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Next Run</TableHead>
                            <TableHead>Remaining</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell className="font-medium">
                                    {schedule.inputMint === USDC_MINT ? "USDC" : "???"} / {schedule.outputMint === SOL_MINT ? "SOL" : "JUP"}
                                </TableCell>
                                <TableCell>{(parseInt(schedule.inAmount) / Math.pow(10, USDC_DECIMALS)).toFixed(2)} USDC</TableCell>
                                <TableCell>
                                    {schedule.status === 'ACTIVE' && schedule.nextExecutionTime ? 
                                        <Countdown to={new Date(schedule.nextExecutionTime)} /> : schedule.status
                                    }
                                </TableCell>
                                <TableCell>{schedule.params.maxNumberOfExecutions}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleCancelSchedule(schedule.id)} disabled={isCancelling !== null}>
                                        {isCancelling === schedule.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4 text-destructive" />}
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
               ) : (
                <div className="text-center text-muted-foreground py-8">
                    {!connected ? "Connect your wallet to manage schedules." : "You have no active DCA schedules."}
                </div>
               )}
            </TabsContent>
          </Tabs>

        </CardContent>
      </Card>
    </motion.div>
  );
}
