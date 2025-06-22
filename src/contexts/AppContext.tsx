"use client";

import React, { createContext, useState, Dispatch, SetStateAction, useEffect } from 'react';
import { config } from '@/config';
import type { RecurringOrder } from '@/lib/jupiter-utils';
import type { TriggerOrder } from '@/lib/jupiter-utils';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export type NetworkMode = 'devnet' | 'mainnet-beta';
export type AppView = 'dust-sweeper' | 'sol-refuel' | 'spam-shield' | 'limit-order' | 'dca-wizard' | 'pro-trader' | null;
export type Chain = 'solana' | 'ethereum' | 'polygon';

// Mock Data Definitions
const initialDustTokens = [
  { name: "LOWB", amount: "0.0012", icon: "https://placehold.co/32x32.png", mint: `sim-lowb-${Date.now()}`, rawAmount: "120", solValue: 0.0001 },
  { name: "TINY", amount: "0.0005", icon: "https://placehold.co/32x32.png", mint: `sim-tiny-${Date.now()}`, rawAmount: "50", solValue: 0.00005 },
  { name: "屑", amount: "1.53", icon: "https://placehold.co/32x32.png", mint: `sim-kuzu-${Date.now()}`, rawAmount: "1530", solValue: 0.00015 },
  { name: "PEANUT", amount: "10.2", icon: "https://placehold.co/32x32.png", mint: `sim-peanut-${Date.now()}`, rawAmount: "10200", solValue: 0.0002 },
];
const initialSpamTokens = [
  { name: "FREESOL.io", icon: "https://placehold.co/32x32.png", mint: `spam-1-${Date.now()}`, tokenAccount: `spam-acc-1-${Date.now()}` },
  { name: "ClaimWen.com", icon: "https://placehold.co/32x32.png", mint: `spam-2-${Date.now()}`, tokenAccount: `spam-acc-2-${Date.now()}` },
  { name: "1000XGEM.xyz", icon: "https://placehold.co/32x32.png", mint: `spam-3-${Date.now()}`, tokenAccount: `spam-acc-3-${Date.now()}` },
  { name: "USDC-Airdrop.net", icon: "https://placehold.co/32x32.png", mint: `spam-4-${Date.now()}`, tokenAccount: `spam-acc-4-${Date.now()}` },
];

export interface DustToken {
    name: string;
    amount: string;
    icon: string;
    mint: string;
    rawAmount: string;
    solValue: number;
}
export interface SpamToken {
    name: string;
    icon: string;
    mint: string;
    tokenAccount: string;
}

interface AppContextType {
    networkMode: NetworkMode;
    setNetworkMode: Dispatch<SetStateAction<NetworkMode>>;
    activeView: AppView;
    setActiveView: Dispatch<SetStateAction<AppView>>;
    isActionInProgress: boolean;
    setIsActionInProgress: Dispatch<SetStateAction<boolean>>;
    chain: Chain;
    setChain: Dispatch<SetStateAction<Chain>>;
    
    // Testnet simulation state
    devnetSolBalance: number;
    setDevnetSolBalance: Dispatch<SetStateAction<number>>;
    devnetUsdcBalance: number;
    setDevnetUsdcBalance: Dispatch<SetStateAction<number>>;
    
    dustTokens: DustToken[];
    setDustTokens: Dispatch<SetStateAction<DustToken[]>>;
    spamTokens: SpamToken[];
    setSpamTokens: Dispatch<SetStateAction<SpamToken[]>>;
    limitOrders: TriggerOrder[];
    setLimitOrders: Dispatch<SetStateAction<TriggerOrder[]>>;
    dcaSchedules: RecurringOrder[];
    setDcaSchedules: Dispatch<SetStateAction<RecurringOrder[]>>;

    // Functions to add more mock data
    addMoreDust: () => void;
    addMoreSpam: () => void;
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
    devnetSolBalance: 0,
    setDevnetSolBalance: () => {},
    devnetUsdcBalance: 0,
    setDevnetUsdcBalance: () => {},
    dustTokens: [],
    setDustTokens: () => {},
    spamTokens: [],
    setSpamTokens: () => {},
    limitOrders: [],
    setLimitOrders: () => {},
    dcaSchedules: [],
    setDcaSchedules: () => {},
    addMoreDust: () => {},
    addMoreSpam: () => {},
});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [networkMode, setNetworkMode] = useState<NetworkMode>(defaultNetworkMode);
    const [activeView, setActiveView] = useState<AppView>(null);
    const [isActionInProgress, setIsActionInProgress] = useState(false);
    const [chain, setChain] = useState<Chain>('solana');

    // Testnet state
    const [devnetSolBalance, setDevnetSolBalance] = useState(0.01 * LAMPORTS_PER_SOL);
    const [devnetUsdcBalance, setDevnetUsdcBalance] = useState(1000);
    const [dustTokens, setDustTokens] = useState<DustToken[]>(initialDustTokens);
    const [spamTokens, setSpamTokens] = useState<SpamToken[]>(initialSpamTokens);
    const [limitOrders, setLimitOrders] = useState<TriggerOrder[]>([]);
    const [dcaSchedules, setDcaSchedules] = useState<RecurringOrder[]>([]);

    const addMoreDust = () => {
        const moreDust = [
            { name: "JUNK", amount: "12.5", icon: "https://placehold.co/32x32.png", mint: `sim-junk-${Date.now()}`, rawAmount: "12500", solValue: 0.0003 },
            { name: "SCRAP", amount: "500", icon: "https://placehold.co/32x32.png", mint: `sim-scrap-${Date.now()}`, rawAmount: "500000", solValue: 0.0008 },
        ];
        setDustTokens(prev => [...prev, ...moreDust]);
    };

    const addMoreSpam = () => {
        const moreSpam = [
            { name: "SCAMCOIN.gg", icon: "https://placehold.co/32x32.png", mint: `spam-5-${Date.now()}`, tokenAccount: `spam-acc-5-${Date.now()}` },
            { name: "MOONSHOT.fi", icon: "https://placehold.co/32x32.png", mint: `spam-6-${Date.now()}`, tokenAccount: `spam-acc-6-${Date.now()}` },
        ];
        setSpamTokens(prev => [...prev, ...moreSpam]);
    };

    // When switching to an EVM chain, default to mainnet if currently on devnet,
    // as our EVM features are mainnet-focused.
    useEffect(() => {
        if (chain !== 'solana' && networkMode === 'devnet') {
            setNetworkMode('mainnet-beta');
        }
    }, [chain, networkMode]);

    return (
        <AppContext.Provider value={{ 
            networkMode, setNetworkMode, 
            activeView, setActiveView,
            isActionInProgress, setIsActionInProgress,
            chain, setChain,
            devnetSolBalance, setDevnetSolBalance,
            devnetUsdcBalance, setDevnetUsdcBalance,
            dustTokens, setDustTokens,
            spamTokens, setSpamTokens,
            limitOrders, setLimitOrders,
            dcaSchedules, setDcaSchedules,
            addMoreDust,
            addMoreSpam,
        }}>
            {children}
        </AppContext.Provider>
    );
};
