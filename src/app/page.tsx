"use client";

import { useContext } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Header from "@/components/header";
import { DustSweeper } from "@/components/dust-sweeper";
import { SolRefuel } from "@/components/sol-refuel";
import { SpamShield } from "@/components/spam-shield";
import { LimitOrder } from "@/components/limit-order";
import { DcaWizard } from "@/components/dca-wizard";
import { ProTrader } from "@/components/pro-trader";
import { Welcome } from "@/components/Welcome";
import { AppContext } from "@/contexts/AppContext";

const components: { [key: string]: React.ComponentType<{ className?: string }> } = {
  "dust-sweeper": DustSweeper,
  "sol-refuel": SolRefuel,
  "spam-shield": SpamShield,
  "limit-order": LimitOrder,
  "dca-wizard": DcaWizard,
  "pro-trader": ProTrader,
};

export default function Home() {
  const { activeView } = useContext(AppContext);

  const ActiveComponent = activeView ? components[activeView] : null;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow flex items-center justify-center p-4 sm:p-6 md:p-8">
        <AnimatePresence mode="wait">
          {ActiveComponent ? (
            <ActiveComponent key={activeView} />
          ) : (
            <Welcome key="welcome" />
          )}
        </AnimatePresence>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>Solv: Wallet Health Hub</p>
      </footer>
    </div>
  );
}
