import Header from "@/components/header";
import { DustSweeper } from "@/components/dust-sweeper";
import { SolRefuel } from "@/components/sol-refuel";
import { SpamShield } from "@/components/spam-shield";
import { LimitOrder } from "@/components/limit-order";
import { DcaWizard } from "@/components/dca-wizard";
import { ProTrader } from "@/components/pro-trader";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-grow p-4 sm:p-6 md:p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          <DustSweeper />
          <SolRefuel />
          <SpamShield />
          <LimitOrder className="md:col-span-2" />
          <DcaWizard />
          <ProTrader />
        </div>
      </main>
      <footer className="text-center p-4 text-sm text-muted-foreground">
        <p>Solv: Wallet Health Hub</p>
      </footer>
    </div>
  );
}
