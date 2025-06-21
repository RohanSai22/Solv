"use client";

import React, { createContext, useState, Dispatch, SetStateAction } from 'react';
import { config } from '@/config';

export type NetworkMode = 'devnet' | 'mainnet-beta';
export type AppView = 'dust-sweeper' | 'sol-refuel' | 'spam-shield' | 'limit-order' | 'dca-wizard' | 'pro-trader' | null;

interface AppContextType {
    networkMode: NetworkMode;
    setNetworkMode: Dispatch<SetStateAction<NetworkMode>>;
    activeView: AppView;
    setActiveView: Dispatch<SetStateAction<AppView>>;
}

const defaultNetworkMode = config.cluster === 'mainnet-beta' ? 'mainnet-beta' : 'devnet';

export const AppContext = createContext<AppContextType>({
    networkMode: defaultNetworkMode,
    setNetworkMode: () => {},
    activeView: null,
    setActiveView: () => {},
});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [networkMode, setNetworkMode] = useState<NetworkMode>(defaultNetworkMode);
    const [activeView, setActiveView] = useState<AppView>(null);

    return (
        <AppContext.Provider value={{ networkMode, setNetworkMode, activeView, setActiveView }}>
            {children}
        </AppContext.Provider>
    );
};
