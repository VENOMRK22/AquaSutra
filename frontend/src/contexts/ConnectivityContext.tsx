
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ConnectivityState {
    isOnline: boolean;
    lastOnlineAt: Date | null;
    wasOffline: boolean;
    clearWasOffline: () => void;
}

const ConnectivityContext = createContext<ConnectivityState>({
    isOnline: true,
    lastOnlineAt: null,
    wasOffline: false,
    clearWasOffline: () => { },
});

export const useConnectivity = () => useContext(ConnectivityContext);

export const ConnectivityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(null);
    const [wasOffline, setWasOffline] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setLastOnlineAt(new Date());
            setWasOffline(true);
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const clearWasOffline = () => {
        setWasOffline(false);
    };

    return (
        <ConnectivityContext.Provider value={{ isOnline, lastOnlineAt, wasOffline, clearWasOffline }}>
            {children}
        </ConnectivityContext.Provider>
    );
};
