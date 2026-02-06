import React, { useEffect, useState } from 'react';
import { API_BASE_URL } from '../lib/config';
import { Search, RefreshCw, ArrowUpRight, ArrowDownRight, MapPin } from 'lucide-react';

interface MarketPrice {
    commodity: string;
    market: string;
    state: string;
    modalPrice: number;
    minPrice: number;
    maxPrice: number;
    arrivalQuantity: number;
    date: string;
    trend: 'GROWING' | 'DEPRECIATING' | 'STABLE';
    changePercent: number;
    demand: 'HIGH' | 'MEDIUM' | 'LOW';
}

interface MarketSnapshot {
    trending: MarketPrice[];
    allTimeBest: MarketPrice[];
    depreciating: MarketPrice[];
    highDemand: MarketPrice[];
    allCrops: MarketPrice[];
}

const Marketplace: React.FC = () => {
    const [overview, setOverview] = useState<MarketSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MarketPrice[]>([]);
    const [locationName, setLocationName] = useState('Prayagraj (Default)');
    const [locationState, setLocationState] = useState('Uttar Pradesh');
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        detectLocation();
    }, []);

    useEffect(() => {
        if (locationState) fetchMarketSnapshot(locationState);
    }, [locationState]);

    useEffect(() => {
        if (searchQuery.trim()) {
            const delayDebounceFn = setTimeout(() => handleSearch(), 300);
            return () => clearTimeout(delayDebounceFn);
        } else {
            setSearchResults([]);
        }
    }, [searchQuery]);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            fetchMarketSnapshot('Uttar Pradesh');
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await res.json();
                const detectedState = data.principalSubdivision || 'Uttar Pradesh';
                const detectedCity = data.city || data.locality || 'Unknown Location';
                setLocationState(detectedState);
                setLocationName(`${detectedCity}, ${detectedState}`);
            } catch (error) {
                console.error("Geocoding failed", error);
                fetchMarketSnapshot('Uttar Pradesh');
            } finally {
                setIsLocating(false);
            }
        }, () => {
            fetchMarketSnapshot('Uttar Pradesh');
            setIsLocating(false);
        });
    };

    const fetchMarketSnapshot = async (state: string) => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/market/snapshot?state=${encodeURIComponent(state)}`);
            const data = await res.json();
            if (data.success) setOverview(data.data);
        } catch (error) {
            console.error("Failed to fetch market snapshot", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/market/search?q=${searchQuery}&state=${encodeURIComponent(locationState)}`);
            const data = await res.json();
            if (data.success) setSearchResults(data.data);
        } catch (error) {
            console.error("Search failed", error);
        }
    };

    const StockRow = ({ crop }: { crop: MarketPrice }) => (
        <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors px-4">
            <div className="flex flex-col w-1/2">
                <span className="font-bold text-gray-900 text-base">{crop.commodity}</span>
                <span className="text-xs text-gray-400 truncate">{crop.market}</span>
            </div>

            <div className="flex flex-col items-end w-1/2">
                <span className="font-bold text-gray-900 tracking-tight">₹{crop.modalPrice}</span>
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${crop.trend === 'GROWING' ? 'bg-green-100 text-green-700' :
                    crop.trend === 'DEPRECIATING' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                    {crop.trend === 'GROWING' ? <ArrowUpRight size={12} /> :
                        crop.trend === 'DEPRECIATING' ? <ArrowDownRight size={12} /> : '-'}
                    <span>{crop.changePercent}%</span>
                </div>
            </div>
        </div>
    );

    const HighlightCard = ({ title, crops, type }: { title: string, crops: MarketPrice[], type: 'gainers' | 'losers' }) => (
        <div className="min-w-[280px] bg-white p-4 rounded-2xl border border-gray-100 shadow-sm mr-4">
            <h3 className="text-sm font-bold text-gray-500 mb-3 uppercase tracking-wider">{title}</h3>
            {crops.slice(0, 3).map((crop, i) => (
                <div key={i} className="flex justify-between items-center mb-3 last:mb-0">
                    <span className="font-medium text-gray-700">{crop.commodity}</span>
                    <span className={`text-sm font-bold ${type === 'gainers' ? 'text-green-600' : 'text-red-600'}`}>
                        {type === 'gainers' ? '+' : ''}{Math.abs(crop.changePercent)}%
                    </span>
                </div>
            ))}
        </div>
    );

    const displayData = searchQuery ? searchResults : (overview?.allCrops || []);

    return (
        <div className="bg-white h-screen flex flex-col font-sans overflow-hidden">
            {/* STATIC TOP SECTION */}
            <div className="bg-white z-20 border-b border-gray-100 flex-none">
                {/* 1. Header & Location */}
                <div className="px-4 pt-6 pb-2">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Market Watch</h1>
                            <div onClick={detectLocation} className="flex items-center gap-1 text-xs font-medium text-gray-500 mt-1 cursor-pointer">
                                <MapPin size={12} />
                                <span>{loading && isLocating ? "Locating..." : locationName}</span>
                                <RefreshCw size={10} className={loading ? "animate-spin" : ""} />
                            </div>
                        </div>
                        <div className="bg-gray-100 p-2 rounded-full">
                            <Search size={20} className="text-gray-500" />
                        </div>
                    </div>

                    {/* 2. Search Bar */}
                    <input
                        type="text"
                        placeholder="Search Symbol (e.g. WHEAT)"
                        className="w-full bg-gray-50 text-gray-900 text-sm font-medium rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-gray-200 transition-all placeholder-gray-400 mb-4"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* 3. Highlights Scroll (Static) */}
                {!searchQuery && overview && !loading && (
                    <div className="flex overflow-x-auto px-4 pb-6 scrollbar-hide snap-x">
                        <HighlightCard title="Top Gainers" crops={overview.trending} type="gainers" />
                        <HighlightCard title="Top Losers" crops={overview.depreciating} type="losers" />
                        <HighlightCard title="High Volume" crops={overview.highDemand} type="gainers" />
                    </div>
                )}

                {/* 4. List Column Headers */}
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex text-xs font-bold text-gray-400 uppercase tracking-wider">
                    <span className="w-1/2">Commodity</span>
                    <span className="w-1/2 text-right">Price</span>
                </div>
            </div>

            {/* SCROLLABLE WATCHLIST SECTION */}
            <div className="flex-1 overflow-y-auto pb-20 bg-white">
                {loading && !overview ? (
                    <div className="flex justify-center p-10"><RefreshCw className="animate-spin text-gray-300" /></div>
                ) : (
                    <div className="pb-10">
                        {displayData.length > 0 ? (
                            displayData.map((crop, i) => <StockRow key={i} crop={crop} />)
                        ) : (
                            <div className="text-center py-10 text-gray-400 text-sm">No commodities found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Marketplace;
