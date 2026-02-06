import React, { useEffect, useState } from 'react';
import { Droplets, RefreshCw, AlertTriangle, MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import WaterForecastModal from './WaterForecastModal';
import { useLanguage } from '../contexts/LanguageContext';
import { API_BASE_URL } from '../lib/config';

interface WaterData {
    balance_mm: number;
    rainfall_6m_mm: number;
    status: 'Surplus' | 'Adequate' | 'Deficit' | 'Critical';
    message: string;
    villageName: string;
    soil_moisture_index: number;
}

const WaterBalanceWidget: React.FC = () => {
    const { t } = useLanguage();
    const [data, setData] = useState<WaterData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);

    const fetchData = async (lat: number, lon: number) => {
        setLoading(true);
        setError(null);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;
            const userId = session?.user?.id;

            if (!token || !userId) throw new Error("User not authenticated");

            // Use relative URL (Vite proxy should handle /api -> localhost:3000)
            const response = await fetch(`${API_BASE_URL}/api/water/score?lat=${lat}&lon=${lon}&userId=${userId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server Error: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Could not load fresh data.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLocate = () => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return;
        }

        setLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ lat: latitude, lon: longitude });
                fetchData(latitude, longitude);
            },
            () => {
                setError("Location access denied. Using default.");
                setLoading(false);
                // Fallback or leave empty? For now show error.
            }
        );
    };

    // Initial load? Maybe wait for user to click "Locate" essentially.
    // Or try to locate automatically once.
    useEffect(() => {
        handleLocate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Helper for Status Colors
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Surplus': return 'text-ios-green bg-green-50';
            case 'Critical': return 'text-ios-red bg-red-50';
            case 'Deficit': return 'text-ios-orange bg-yellow-50';
            default: return 'text-ios-blue bg-blue-50';
        }
    };

    // Burn Rate Logic (Simplified for UI display based on Soil Moisture)
    // 0.3 mean moisture ~= 30%. If low, burn rate is high/critical.
    const burnRate = data ? ((1 - data.soil_moisture_index) * 10).toFixed(1) : '0';
    const [showForecast, setShowForecast] = useState(false);

    if (error) {
        return (
            <div className="bg-white rounded-[1.5rem] p-6 shadow-ios-lg relative overflow-hidden flex flex-col items-center justify-center text-center gap-2">
                <AlertTriangle className="text-ios-orange" size={32} />
                <p className="text-ios-subtext text-sm">{error}</p>
                <button onClick={handleLocate} className="text-ios-blue font-semibold text-sm">Retry</button>
            </div>
        );
    }

    return (
        <>
            <div onClick={() => setShowForecast(true)} className="bg-white rounded-[1.5rem] p-6 shadow-ios-lg relative overflow-hidden active:scale-[0.98] transition-all cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${data ? getStatusColor(data.status) : 'bg-gray-100 text-gray-500'}`}>
                                {loading ? t('dashboard.loading') : (data?.status || t('widget.live_status'))}
                            </span>
                            {data?.villageName && (
                                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                                    <MapPin size={10} /> {data.villageName}
                                </span>
                            )}
                        </div>

                        <h2 className="text-ios-subtext text-sm font-medium">{t('widget.water_balance')}</h2>
                    </div>
                    <div
                        onClick={(e) => { e.stopPropagation(); handleLocate(); }}
                        className="bg-blue-50 p-2 rounded-full text-ios-blue cursor-pointer active:scale-90 transition-transform"
                    >
                        {loading ? <RefreshCw size={24} className="animate-spin" /> : <Droplets size={24} />}
                    </div>
                </div>

                <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-ios-text tracking-tight">
                        {data ? data.balance_mm : '---'}
                    </span>
                    <span className="text-ios-subtext text-base font-medium">{t('widget.mm_depth')}</span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">{data?.message || t('widget.connect_gps')}</span>
                    </div>

                    {data && (
                        <div className="flex items-center gap-2 p-2 bg-red-50 rounded-lg">
                            <span className="text-ios-red text-xs font-semibold">🔥 {t('widget.burn_rate')}:</span>
                            <span className="text-ios-red text-xs">{t('widget.soil_losing')} ~{burnRate}mm/day</span>
                        </div>
                    )}
                </div>

                {/* Visual Bar */}
                <div className="mt-5 h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-1000 ${data?.status === 'Critical' ? 'bg-ios-red' : 'bg-ios-blue'}`}
                        style={{ width: data ? `${Math.min(data.soil_moisture_index * 100, 100)}%` : '0%' }}
                    />
                </div>
            </div>

            {/* Forecast Modal */}
            <WaterForecastModal
                isOpen={showForecast}
                onClose={() => setShowForecast(false)}
                lat={location?.lat || 0} // Might be 0 if not located, modal handles fetch check
                lon={location?.lon || 0}
            />
        </>
    );
};

export default WaterBalanceWidget;
