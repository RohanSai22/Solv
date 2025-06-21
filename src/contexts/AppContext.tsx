"use client";

import React, { createContext, useState, Dispatch, SetStateAction } from 'react';

export type NetworkMode = 'devnet' | 'mainnet-beta';
export type AppView = 'dust-sweeper' | 'sol-refuel' | 'spam-shield' | 'limit-order' | 'dca-wizard' | 'pro-trader' | null;

interface AppContextType {
    networkMode: NetworkMode;
    setNetworkMode: Dispatch<SetStateAction<NetworkMode>>;
    activeView: AppView;
    setActiveView: Dispatch<SetStateAction<AppView>>;
}

export const AppContext = createContext<AppContextType>({
    networkMode: 'devnet',
    setNetworkMode: () => {},
    activeView: null,
    setActiveView: () => {},
});

export const AppContextProvider = ({ children }: { children: React.ReactNode }) => {
    const [networkMode, setNetworkMode] = useState<NetworkMode>('devnet');
    const [activeView, setActiveView] = useState<AppView>(null);

    return (
        <AppContext.Provider value={{ networkMode, setNetworkMode, activeView, setActiveView }}>
            {children}
        </AppContext.Provider>
    );
};
