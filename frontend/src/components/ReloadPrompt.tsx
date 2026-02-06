import React from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { RefreshCw, X } from 'lucide-react';

const ReloadPrompt: React.FC = () => {
    // safe-area-inset-bottom support
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: any) {
            console.log('SW Registered: ' + r)
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error)
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    if (!offlineReady && !needRefresh) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 animate-slide-up-banner safe-pb">
            <div className="bg-black/80 backdrop-blur-md text-white p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-4 max-w-md mx-auto">
                <div className="flex-1">
                    <h3 className="font-bold text-sm mb-0.5">
                        {offlineReady ? 'App is ready to work offline' : 'New content available'}
                    </h3>
                    <p className="text-xs text-gray-300">
                        {offlineReady 
                            ? 'You can now use the app without internet.' 
                            : 'Click reload to update to the latest version.'}
                    </p>
                </div>
                
                {needRefresh && (
                    <button 
                        onClick={() => updateServiceWorker(true)}
                        className="bg-ios-blue text-white px-4 py-2 rounded-xl text-xs font-bold active:scale-95 transition-transform flex items-center gap-2"
                    >
                        <RefreshCw size={14} /> Reload
                    </button>
                )}

                <button 
                    onClick={close}
                    className="p-2 bg-white/10 rounded-full text-gray-400 hover:text-white"
                >
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default ReloadPrompt;
