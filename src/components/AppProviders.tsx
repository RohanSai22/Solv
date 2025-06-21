"use client";

import React, { useContext, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { AppContext, AppContextProvider } from '@/contexts/AppContext';
import { getRpcUrl } from '@/config';

function WalletAppProviders({ children }: { children: React.ReactNode }) {
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
        <AppContextProvider>
            <WalletAppProviders>
                {children}
            </WalletAppProviders>
        </AppContextProvider>
    )
}
