
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
import { CalendarClock, Loader2, Info, Trash2, Calendar as CalendarIcon } from "lucide-react";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addWeeks, addMonths } from "date-fns";
import { cn } from "@/lib/utils";

type DcaSchedule = {
  id: string;
  spendToken: string;
  buyToken: string;
  amount: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  startDate: Date;
};

const initialSchedules: DcaSchedule[] = [
  { id: "1", spendToken: "USDC", buyToken: "SOL", amount: "100", frequency: "Weekly", startDate: new Date() },
  { id: "2", spendToken: "SOL", buyToken: "JUP", amount: "5", frequency: "Monthly", startDate: new Date() },
];

const getNextRun = (schedule: DcaSchedule) => {
    const now = new Date();
    let nextRun = schedule.startDate;
    while (nextRun < now) {
      if (schedule.frequency === 'Daily') nextRun = addDays(nextRun, 1);
      else if (schedule.frequency === 'Weekly') nextRun = addWeeks(nextRun, 1);
      else if (schedule.frequency === 'Monthly') nextRun = addMonths(nextRun, 1);
    }
    return format(nextRun, "PPP");
}

export function DcaWizard({ className }: { className?: string }) {
  const { networkMode, isActionInProgress, setIsActionInProgress } = useContext(AppContext);
  const { connected } = useWallet();
  const { toast } = useToast();
  
  const [schedules, setSchedules] = useState<DcaSchedule[]>(initialSchedules);
  
  // Form state
  const [spendToken, setSpendToken] = useState('');
  const [buyToken, setBuyToken] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly' | ''>('');
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());

  const isMainnet = networkMode === 'mainnet-beta';
  const isFormDisabled = (isMainnet && !connected) || isActionInProgress;
  const canCreate = spendToken && buyToken && amount && frequency && startDate;

  useEffect(() => {
    return () => {
      setIsActionInProgress(false);
    };
  }, [setIsActionInProgress]);

  const handleScheduleDca = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canCreate) return;

    setIsActionInProgress(true);
    // This is a simulation on both Mainnet and Devnet because real DCA requires a backend cron job ("cranker").
    setTimeout(() => {
      const newSchedule: DcaSchedule = {
        id: new Date().toISOString(),
        spendToken,
        buyToken,
        amount,
        frequency,
        startDate,
      };
      setSchedules(prev => [newSchedule, ...prev]);
      setIsActionInProgress(false);
      
      // Reset form
      setSpendToken('');
      setBuyToken('');
      setAmount('');
      setFrequency('');
      setStartDate(new Date());
      
      toast({
        title: "DCA Scheduled (Simulated)",
        description: `Your new ${frequency.toLowerCase()} schedule to buy ${buyToken} has been created.`,
      });
    }, 1500);
  };
  
  const handleCancelSchedule = (id: string) => {
    setSchedules(prev => prev.filter(s => s.id !== id));
    toast({
        title: "DCA Schedule Cancelled",
        description: "The selected schedule has been cancelled.",
        variant: "destructive",
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <Card className="flex flex-col w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="font-headline flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-accent" />
            DCA Wizard
          </CardTitle>
          <CardDescription>
            Schedule and manage dollar-cost averaging strategies. All actions are simulated.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-grow space-y-4">
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 p-2 rounded-md">
            <Info className="w-4 h-4" />
            <p>
              You are in <span className="font-bold">{networkMode === 'devnet' ? 'Testnet Mode' : 'Mainnet Mode'}</span>. 
              All DCA actions are simulated as a backend service is required for real execution.
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
                      <Label htmlFor="spend-token">Spend Token</Label>
                      <Select value={spendToken} onValueChange={setSpendToken} disabled={isFormDisabled}>
                        <SelectTrigger id="spend-token">
                          <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC">USDC</SelectItem>
                          <SelectItem value="SOL">SOL</SelectItem>
                          <SelectItem value="JUP">JUP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="buy-token">Buy Token</Label>
                      <Select value={buyToken} onValueChange={setBuyToken} disabled={isFormDisabled}>
                        <SelectTrigger id="buy-token">
                          <SelectValue placeholder="Select token" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="SOL">SOL</SelectItem>
                          <SelectItem value="JUP">JUP</SelectItem>
                          <SelectItem value="BONK">BONK</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="spend-amount">Amount to spend each time</Label>
                    <Input id="spend-amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 100" type="number" disabled={isFormDisabled} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select value={frequency} onValueChange={(value) => setFrequency(value as any)} disabled={isFormDisabled}>
                        <SelectTrigger id="frequency">
                          <SelectValue placeholder="Select frequency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Daily">Daily</SelectItem>
                          <SelectItem value="Weekly">Weekly</SelectItem>
                          <SelectItem value="Monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                       <Label htmlFor="start-date">Start Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !startDate && "text-muted-foreground"
                              )}
                              disabled={isFormDisabled}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={startDate}
                              onSelect={setStartDate}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                    </div>
                  </div>
                </div>
                <Button className="w-full mt-6" disabled={isFormDisabled || !canCreate} type="submit">
                  {isActionInProgress && <Loader2 className="animate-spin" />}
                  {isActionInProgress ? "Scheduling..." : "Schedule DCA"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="manage" className="mt-4">
               {schedules.length > 0 ? (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Pair</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Frequency</TableHead>
                            <TableHead>Next Run</TableHead>
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell className="font-medium">{schedule.spendToken}/{schedule.buyToken}</TableCell>
                                <TableCell>{schedule.amount} {schedule.spendToken}</TableCell>
                                <TableCell>{schedule.frequency}</TableCell>
                                <TableCell>{getNextRun(schedule)}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" onClick={() => handleCancelSchedule(schedule.id)} disabled={isActionInProgress}>
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
               ) : (
                <div className="text-center text-muted-foreground py-8">
                    You have no active DCA schedules.
                </div>
               )}
            </TabsContent>
          </Tabs>

        </CardContent>
      </Card>
    </motion.div>
  );
}
