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
import { Star, Zap, LineChart, Layers, GitPullRequest, SlidersHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

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
      <Card className="flex flex-col w-full max-w-2xl border-2 border-amber-400 shadow-amber-400/20 shadow-lg">
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
        <CardContent className="flex-grow space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureItem
              icon={LineChart}
              title="Advanced Charting"
              description="Real-time price feeds, depth charts, and historical data analysis."
            />
            <FeatureItem
              icon={Layers}
              title="Ladder Orders"
              description="Automatically scale in and out of positions at different price levels."
            />
            <FeatureItem
              icon={GitPullRequest}
              title="OCO Orders"
              description="Set simultaneous take-profit and stop-loss orders to manage risk."
            />
            <FeatureItem
              icon={SlidersHorizontal}
              title="Precision Controls"
              description="Fine-tune slippage tolerance and priority fees for every trade."
            />
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

function FeatureItem({ icon: Icon, title, description }: { icon: React.ElementType, title: string, description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="p-2 bg-amber-400/10 rounded-full">
        <Icon className="w-6 h-6 text-amber-400" />
      </div>
      <div>
        <h3 className="font-semibold">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}
