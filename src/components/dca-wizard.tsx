
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
import { CalendarClock, Loader2, Info, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "@/contexts/AppContext";
import { useWallet } from "@solana/wallet-adapter-react";
import { useToast } from "@/hooks/use-toast";
import { getJupiterApiUrl } from "@/lib/jupiter-utils";

type DcaSchedule = {
  id: string;
  spendToken: string;
  buyToken: string;
  amount: string;
  frequency: string;
};

const initialSchedules: DcaSchedule[] = [
  { id: "1", spendToken: "USDC", buyToken: "SOL", amount: "100", frequency: "Weekly" },
  { id: "2", spendToken: "SOL", buyToken: "JUP", amount: "5", frequency: "Monthly" },
];


export function DcaWizard({ className }: { className?: string }) {
  const { networkMode, isActionInProgress, setIsActionInProgress } = useContext(AppContext);
  const { connected } = useWallet();
  const { toast } = useToast();
  
  const [schedules, setSchedules] = useState<DcaSchedule[]>(initialSchedules);
  
  // Form state
  const [spendToken, setSpendToken] = useState('');
  const [buyToken, setBuyToken] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState('');

  const isMainnet = networkMode === 'mainnet-beta';
  const isFormDisabled = (isMainnet && !connected) || isActionInProgress;
  const canCreate = spendToken && buyToken && amount && frequency;

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
      };
      setSchedules(prev => [newSchedule, ...prev]);
      setIsActionInProgress(false);
      
      // Reset form
      setSpendToken('');
      setBuyToken('');
      setAmount('');
      setFrequency('');
      
      toast({
        title: "DCA Scheduled (Simulated)",
        description: "Your new dollar-cost averaging schedule has been created.",
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
            Schedule and manage dollar-cost averaging strategies.
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
                  <div className="space-y-2">
                    <Label htmlFor="spend-amount">Amount to spend each time</Label>
                    <Input id="spend-amount" value={amount} onChange={e => setAmount(e.target.value)} placeholder="e.g., 100" type="number" disabled={isFormDisabled} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="frequency">Frequency</Label>
                    <Select value={frequency} onValueChange={setFrequency} disabled={isFormDisabled}>
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
                            <TableHead className="text-right">Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schedules.map((schedule) => (
                            <TableRow key={schedule.id}>
                                <TableCell className="font-medium">{schedule.spendToken}/{schedule.buyToken}</TableCell>
                                <TableCell>{schedule.amount} {schedule.spendToken}</TableCell>
                                <TableCell>{schedule.frequency}</TableCell>
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
