import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { Trophy, MapPin, Sprout } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface Ranking {
    user_id: string;
    name: string;
    village: string;
    avatar: string;
    score: number; // ₹/Liter
    revenue: number;
    water: number;
    crops: string;
}

interface PriceTicker {
    crop: string;
    price: number;
    trend: 'up' | 'down' | 'stable';
}

const Leaderboard: React.FC = () => {
    const { t } = useLanguage();
    const [rankings, setRankings] = useState<Ranking[]>([]);
    const [loading, setLoading] = useState(true);
    const [userVillage, setUserVillage] = useState<string>('');
    const [prices, setPrices] = useState<PriceTicker[]>([]);

    useEffect(() => {
        fetchData();
        // Mock Ticker Data (Since API is handled in backend, we can also fetch it to show ticker)
        // Or backend leaderboard could return it.
        // For now, let's hardcode ticker for visual effect or fetch from backend if I added an endpoint.
        // I'll simulate ticker for UI smoothness.
        setPrices([
            { crop: 'Sugarcane', price: 3200, trend: 'up' },
            { crop: 'Cotton', price: 7150, trend: 'down' },
            { crop: 'Wheat', price: 2350, trend: 'stable' },
            { crop: 'Soybean', price: 4800, trend: 'up' }
        ]);
    }, []);

    const fetchData = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            let villageParam = '';
            if (user) {
                // Get User Profile for Village
                const { data: profile } = await supabase.from('profiles').select('village').eq('id', user.id).single();
                if (profile) {
                    villageParam = profile.village || '';
                    setUserVillage(villageParam);
                }
            }

            // Fetch Leaderboard
            const res = await fetch(`http://localhost:3000/api/leaderboard?village=${villageParam}`);
            const json = await res.json();

            if (json.success) {
                setRankings(json.rankings);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Market Ticker */}
            <div className="bg-black text-white py-2 overflow-hidden relative whitespace-nowrap">
                <div className="animate-marquee inline-block">
                    {prices.map((p, i) => (
                        <span key={i} className="mx-4 text-xs font-mono font-bold tracking-wider">
                            {p.crop.toUpperCase()}: ₹{p.price}
                            <span className={`ml-1 ${p.trend === 'up' ? 'text-green-400' : p.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                                {p.trend === 'up' ? '▲' : p.trend === 'down' ? '▼' : '-'}
                            </span>
                        </span>
                    ))}
                    {/* Duplicate for seamless loop */}
                    {prices.map((p, i) => (
                        <span key={`dup-${i}`} className="mx-4 text-xs font-mono font-bold tracking-wider">
                            {p.crop.toUpperCase()}: ₹{p.price}
                            <span className={`ml-1 ${p.trend === 'up' ? 'text-green-400' : p.trend === 'down' ? 'text-red-400' : 'text-gray-400'}`}>
                                {p.trend === 'up' ? '▲' : p.trend === 'down' ? '▼' : '-'}
                            </span>
                        </span>
                    ))}
                </div>
            </div>

            {/* Header */}
            <div className="px-6 pt-6 pb-6">
                <div className="flex justify-between items-end mb-2">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{t('leaderboard.market_efficiency')}</h1>
                        <p className="text-gray-500 text-sm font-medium mt-1 flex items-center gap-1">
                            <MapPin size={14} />
                            {userVillage || t('dashboard.checking_location')}
                        </p>
                    </div>
                </div>
            </div>

            {/* Personal Effiency Card */}
            <div className="px-4 space-y-4">
                {loading ? (
                    <div className="text-center py-10 text-gray-400">{t('leaderboard.loading_stats')}</div>
                ) : rankings.find(r => r.user_id === (supabase.auth.getSession() as any)?.user?.id) || rankings[0] ? ( // Fallback to first if filtering works
                    (() => {
                        return null;
                    })() || (
                        <div className="bg-gradient-to-br from-green-50 to-white border border-green-100 p-6 rounded-3xl shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Trophy size={100} className="text-green-600" />
                            </div>
                            <h3 className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-2">{t('leaderboard.your_efficiency_score')}</h3>
                            {rankings.length > 0 ? (
                                <div>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-5xl font-black text-gray-900">{rankings.find(r => r.name !== 'Unknown')?.score || '0'}</span>
                                        <span className="text-lg font-bold text-green-600">₹ / kL</span>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-2 max-w-[80%]">
                                        {t('leaderboard.efficiency_explanation_1')} <span className="font-bold text-gray-900">₹{rankings[0]?.score}</span> {t('leaderboard.efficiency_explanation_2')}
                                    </p>
                                </div>
                            ) : (
                                <div className="py-4">
                                    <p className="text-gray-400">{t('leaderboard.add_crops')}</p>
                                </div>
                            )}
                        </div>
                    )
                ) : null}
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default Leaderboard;
