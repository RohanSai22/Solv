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
import { CalendarClock } from "lucide-react";

export function DcaWizard() {
  return (
    <Card className="flex flex-col">
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
        <div className="space-y-2">
          <Label htmlFor="spend-amount">Amount to spend</Label>
          <Input id="spend-amount" placeholder="e.g., 100" type="number" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="spend-token">Spend Token</Label>
          <Select>
            <SelectTrigger id="spend-token">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="usdc">USDC</SelectItem>
              <SelectItem value="sol">SOL</SelectItem>
              <SelectItem value="jup">JUP</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="buy-token">Buy Token</Label>
          <Select>
            <SelectTrigger id="buy-token">
              <SelectValue placeholder="Select token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sol">SOL</SelectItem>
              <SelectItem value="jup">JUP</SelectItem>
              <SelectItem value="bonk">BONK</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequency</Label>
          <Select>
            <SelectTrigger id="frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
              <SelectItem value="monthly">Monthly</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full">
          Schedule DCA
        </Button>
      </CardFooter>
    </Card>
  );
}
