"use client";

import React, { createContext, useState, Dispatch, SetStateAction } from 'react';
import { config } from '@/config';

export type NetworkMode = 'devnet' | 'mainnet-beta';
export type AppView = 'dust-sweeper' | 'sol-refuel' | 'spam-shield' | 'limit-order' | 'dca-wizard' | 'pro-trader' | null;
export type Chain = 'solana' | 'ethereum' | 'polygon';

interface AppContextType {
    networkMode: NetworkMode;
    setNetworkMode: Dispatch<SetStateAction<NetworkMode>>;
    activeView: AppView;
    setActiveView: Dispatch<SetStateAction<AppView>>;
    isActionInProgress: boolean;
    setIsActionInProgress: Dispatch<SetStateAction<boolean>>;
    chain: Chain;
    setChain: Dispatch<SetStateAction<Chain>>;
}

const defaultNetworkMode = config.cluster === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';

export const AppContext = createContext<AppContextType>({
    networkMode: defaultNetworkMode,
    setNetworkMode: () => {},
    activeView: null,
    setActiveView: () => {},
    isActionInProgress: false,
    setIsActionInProgress: () => {},
    chain: 'solana',
    setChain: () => {},
});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [networkMode, setNetworkMode] = useState<NetworkMode>(defaultNetworkMode);
    const [activeView, setActiveView] = useState<AppView>(null);
    const [isActionInProgress, setIsActionInProgress] = useState(false);
    const [chain, setChain] = useState<Chain>('solana');

    return (
        <AppContext.Provider value={{ 
            networkMode, setNetworkMode, 
            activeView, setActiveView,
            isActionInProgress, setIsActionInProgress,
            chain, setChain,
        }}>
            {children}
        </AppContext.Provider>
    );
};
