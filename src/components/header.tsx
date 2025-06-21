"use client";

import { useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AppContext, AppView } from '@/contexts/AppContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';

const navItems: { view: AppView; label: string }[] = [
  { view: 'dust-sweeper', label: 'Dust Sweeper' },
  { view: 'sol-refuel', label: 'SOL Refuel' },
  { view: 'spam-shield', label: 'Spam Shield' },
  { view: 'limit-order', label: 'Limit Orders' },
  { view: 'dca-wizard', label: 'DCA Wizard' },
  { view: 'pro-trader', label: 'Pro Trader' },
];

export default function Header() {
  const { networkMode, setNetworkMode, activeView, setActiveView } = useContext(AppContext);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-auto flex items-center">
          <button onClick={() => setActiveView(null)} className="flex items-center gap-2">
            <Icons.logo className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold font-headline tracking-tighter">
              Solv
            </h1>
          </button>
        </div>
        
        <nav className="hidden md:flex items-center space-x-2 lg:space-x-4 mx-4">
          {navItems.map(item => (
            <Button 
              key={item.view}
              variant={activeView === item.view ? 'secondary': 'ghost'}
              size="sm"
              onClick={() => setActiveView(item.view)}
              className="relative"
            >
              {item.label}
              {activeView === item.view && (
                <motion.div 
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  layoutId="underline"
                />
              )}
            </Button>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="network-mode" className="text-xs sm:text-sm text-muted-foreground">Testnet</Label>
            <Switch 
              id="network-mode" 
              checked={networkMode === 'mainnet-beta'}
              onCheckedChange={(checked) => setNetworkMode(checked ? 'mainnet-beta' : 'devnet')}
            />
            <Label htmlFor="network-mode" className="text-xs sm:text-sm">Mainnet</Label>
          </div>
          <Separator orientation="vertical" className="h-6" />
          <WalletMultiButton style={{height: '36px', fontSize: '14px'}} />
        </div>
      </div>
    </header>
  );
}
