
import React, { useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { useConnectivity } from '../contexts/ConnectivityContext';
import { useLanguage } from '../contexts/LanguageContext';

const OfflineBanner: React.FC = () => {
    const { isOnline, wasOffline, clearWasOffline } = useConnectivity();
    const { t } = useLanguage();

    // Auto-dismiss "Back Online" toast after 3 seconds
    useEffect(() => {
        if (wasOffline && isOnline) {
            const timer = setTimeout(() => {
                clearWasOffline();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [wasOffline, isOnline, clearWasOffline]);

    if (!isOnline) {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-3 shadow-md animate-slide-down">
                <div className="flex items-start justify-between max-w-lg mx-auto">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-full">
                            <WifiOff size={20} className="text-white" />
                        </div>
                        <div>
                            <p className="font-bold text-sm">{t('connectivity.offline')}</p>
                            <p className="text-xs text-amber-50 opacity-90 mt-0.5">{t('connectivity.offline_message')}</p>
                        </div>
                    </div>
                    {/* Dismiss button optional if we want it strictly persistent, 
                        but nice to have just in case. 
                        However, requirements say: "reappears if still offline and user navigates".
                        Simple implementation: just show it always when offline. 
                    */}
                </div>
            </div>
        );
    }

    if (wasOffline && isOnline) {
        return (
            <div className="fixed top-0 left-0 right-0 z-50 bg-green-500 text-white px-4 py-3 shadow-md animate-slide-down">
                <div className="flex items-center justify-center gap-2">
                    <Wifi size={20} />
                    <span className="font-bold text-sm">{t('connectivity.back_online')}</span>
                </div>
            </div>
        );
    }

    return null;
};

export default OfflineBanner;
