"use client";

import { useContext } from 'react';
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { AppContext, AppView, Chain } from '@/contexts/AppContext';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { motion } from 'framer-motion';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { Menu, ChevronDown } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const navItems: { view: AppView; label: string }[] = [
  { view: 'dust-sweeper', label: 'Dust Sweeper' },
  { view: 'sol-refuel', label: 'SOL Refuel' },
  { view: 'spam-shield', label: 'Spam Shield' },
  { view: 'limit-order', label: 'Limit Orders' },
  { view: 'dca-wizard', label: 'DCA Wizard' },
  { view: 'pro-trader', label: 'Pro Trader' },
];

const chainLabels: Record<Chain, string> = {
  solana: "Solana",
  ethereum: "Ethereum",
  polygon: "Polygon",
};

function WalletConnectButton() {
  const { chain } = useContext(AppContext);

  if (chain === 'solana') {
    return <WalletMultiButton style={{height: '40px', fontSize: '14px'}} />;
  }
  
  return <ConnectButton />;
}

function MobileWalletConnectButton() {
    const { chain } = useContext(AppContext);

  if (chain === 'solana') {
    return <WalletMultiButton style={{ width: '100%' }} />;
  }

  return <div className="w-full"><ConnectButton /></div>;
}


export default function Header() {
  const { networkMode, setNetworkMode, activeView, setActiveView, isActionInProgress, chain, setChain } = useContext(AppContext);

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

        <div className="flex items-center justify-end space-x-2 md:space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="hidden md:flex">
                {chainLabels[chain]}
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setChain('solana')}>Solana</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setChain('ethereum')}>Ethereum</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setChain('polygon')}>Polygon</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="hidden md:flex items-center space-x-2">
            <Label htmlFor="network-mode-desktop" className="text-xs sm:text-sm text-muted-foreground">Testnet</Label>
            <Switch 
              id="network-mode-desktop"
              disabled={isActionInProgress || chain !== 'solana'}
              checked={networkMode === 'mainnet-beta'}
              onCheckedChange={(checked) => setNetworkMode(checked ? 'mainnet-beta' : 'devnet')}
            />
            <Label htmlFor="network-mode-desktop" className="text-xs sm:text-sm">Mainnet</Label>
          </div>
          <Separator orientation="vertical" className="h-6 hidden md:block" />
          <div className="hidden md:block">
             <WalletConnectButton />
          </div>

          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full max-w-xs p-0">
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b">
                    <SheetClose asChild>
                      <button onClick={() => setActiveView(null)} className="flex items-center gap-2">
                        <Icons.logo className="h-8 w-8 text-primary" />
                        <h1 className="text-2xl font-bold font-headline tracking-tighter">
                          Solv
                        </h1>
                      </button>
                    </SheetClose>
                  </div>
                  <nav className="flex-grow p-4 space-y-2">
                    {navItems.map(item => (
                      <SheetClose asChild key={item.view}>
                        <Button
                          variant={activeView === item.view ? 'secondary': 'ghost'}
                          className="w-full justify-start"
                          onClick={() => setActiveView(item.view)}
                        >
                          {item.label}
                        </Button>
                      </SheetClose>
                    ))}
                  </nav>
                  <div className="p-4 border-t space-y-4">
                     <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" className="w-full">
                            {chainLabels[chain]}
                            <ChevronDown className="ml-2 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[calc(100vw-2rem)]">
                          <DropdownMenuItem onSelect={() => setChain('solana')}>Solana</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setChain('ethereum')}>Ethereum</DropdownMenuItem>
                          <DropdownMenuItem onSelect={() => setChain('polygon')}>Polygon</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                    <div className="flex items-center justify-center space-x-2">
                      <Label htmlFor="network-mode-mobile" className="text-sm text-muted-foreground">Testnet</Label>
                      <Switch 
                        id="network-mode-mobile"
                        disabled={isActionInProgress || chain !== 'solana'}
                        checked={networkMode === 'mainnet-beta'}
                        onCheckedChange={(checked) => setNetworkMode(checked ? 'mainnet-beta' : 'devnet')}
                      />
                      <Label htmlFor="network-mode-mobile" className="text-sm">Mainnet</Label>
                    </div>
                     <MobileWalletConnectButton />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
