"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Icons.logo className="h-8 w-8 text-primary" />
          <h1 className="ml-2 text-2xl font-bold font-headline tracking-tighter">
            Solv
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2 md:space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="network-mode" className="text-xs sm:text-sm text-muted-foreground">Testnet</Label>
            <Switch id="network-mode" />
            <Label htmlFor="network-mode" className="text-xs sm:text-sm">Mainnet</Label>
          </div>
          <Separator orientation="vertical" className="h-6 hidden sm:block" />
          <nav className="flex items-center space-x-2">
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Icons.phantom className="h-4 w-4 mr-2" />
              Phantom
            </Button>
            <Button variant="outline" size="sm" className="hidden sm:flex">
              <Icons.metamask className="h-4 w-4 mr-2" />
              Metamask
            </Button>
            <Button variant="ghost" size="icon" className="sm:hidden">
                <Icons.phantom className="h-5 w-5" />
                <span className="sr-only">Connect Phantom</span>
            </Button>
             <Button variant="ghost" size="icon" className="sm:hidden">
                <Icons.metamask className="h-5 w-5" />
                <span className="sr-only">Connect Metamask</span>
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}
