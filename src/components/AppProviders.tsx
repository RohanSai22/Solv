"use client";

import React, { useContext, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { AppContext, AppContextProvider } from '@/contexts/AppContext';
import { getRpcUrl } from '@/config';
import {
  RainbowKitProvider,
  getDefaultConfig,
  darkTheme
} from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  polygon,
} from 'wagmi/chains';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const queryClient = new QueryClient();

// This project ID is a placeholder. In a real app, you would get one from WalletConnect Cloud.
const wagmiConfig = getDefaultConfig({
  appName: 'Solv Wallet Health Hub',
  projectId: 'a527f3c8f7f9b8d2651475764197c36b',
  chains: [mainnet, polygon],
  ssr: true, 
});


function SolanaWalletProviders({ children }: { children: React.ReactNode }) {
    const { networkMode } = useContext(AppContext);

    const endpoint = useMemo(() => getRpcUrl(networkMode), [networkMode]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
        ],
        // Wallets are re-initialized when the network changes to clear any stale connections
        [networkMode]
    );

    return (
        <ConnectionProvider endpoint={endpoint}>
            <WalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </WalletProvider>
        </ConnectionProvider>
    );
}

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <RainbowKitProvider
             theme={darkTheme({
              accentColor: 'hsl(var(--primary))',
              accentColorForeground: 'hsl(var(--primary-foreground))',
              borderRadius: 'medium',
              fontStack: 'system',
             })}
          >
            <AppContextProvider>
                <SolanaWalletProviders>
                    {children}
                </SolanaWalletProviders>
            </AppContextProvider>
          </RainbowKitProvider>
        </QueryClientProvider>
      </WagmiProvider>
    )
}
