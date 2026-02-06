import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';

interface TickerItem {
    commodity: string;
    modalPrice: number;
    trend: 'GROWING' | 'DEPRECIATING' | 'STABLE';
    changePercent: number;
}

export const LivePriceTicker: React.FC = () => {
    const [ticker, setTicker] = useState<TickerItem[]>([]);

    useEffect(() => {
        fetchTicker();
        const interval = setInterval(fetchTicker, 2 * 60 * 1000); // Every 2 min
        return () => clearInterval(interval);
    }, []);

    const fetchTicker = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/market/ticker`);
            const data = await res.json();
            if (data.success) {
                setTicker(data.data);
            }
        } catch (error) {
            console.error('Ticker fetch failed:', error);
        }
    };

    if (ticker.length === 0) return null;

    return (
        <>
            <div className="bg-black text-white py-2 overflow-hidden relative whitespace-nowrap">
                <div className="animate-scroll inline-block">
                    {ticker.concat(ticker).map((item, index) => (
                        <span key={index} className="inline-flex items-center gap-2 mx-6">
                            <span className="font-semibold text-xs tracking-wider">{item.commodity.toUpperCase()}:</span>
                            <span className="font-bold text-sm">₹{item.modalPrice}</span>
                            {item.trend !== 'STABLE' && (
                                <span className={`inline-flex items-center gap-0.5 text-xs ${item.trend === 'GROWING' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                    {item.trend === 'GROWING' ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                                    {Math.abs(item.changePercent)}%
                                </span>
                            )}
                        </span>
                    ))}
                </div>
            </div>
            <style>{`
            @keyframes scroll {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
            }

            .animate-scroll {
            animation: scroll 30s linear infinite;
            }
        `}</style>
        </>
    );
};
