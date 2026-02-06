import React, { useEffect, useState } from 'react';
import { Search, TrendingUp, TrendingDown, Award, Activity, MapPin, RefreshCw } from 'lucide-react';

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
}

const Marketplace: React.FC = () => {
    const [overview, setOverview] = useState<MarketSnapshot | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<MarketPrice[]>([]);
    const [isSearching, setIsSearching] = useState(false);

    // Location State
    const [locationName, setLocationName] = useState('Prayagraj (Default)');
    const [locationState, setLocationState] = useState('Uttar Pradesh');
    const [isLocating, setIsLocating] = useState(false);

    useEffect(() => {
        // Try to get live location on mount
        detectLocation();
    }, []);

    // When locationState changes, fetch new data
    useEffect(() => {
        if (locationState) {
            fetchMarketSnapshot(locationState);
        }
    }, [locationState]);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchQuery.trim()) {
                handleSearch();
            } else {
                setSearchResults([]);
                setIsSearching(false);
            }
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchQuery]);

    const detectLocation = () => {
        if (!navigator.geolocation) {
            console.warn("Geolocation is not supported by this browser.");
            fetchMarketSnapshot('Uttar Pradesh'); // Fallback
            return;
        }

        setIsLocating(true);
        navigator.geolocation.getCurrentPosition(async (position) => {
            const { latitude, longitude } = position.coords;
            try {
                // Reverse Geocoding to get State Name
                const res = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                const data = await res.json();

                // data.principalSubdivision is usually the State name
                const detectedState = data.principalSubdivision || 'Uttar Pradesh';
                const detectedCity = data.city || data.locality || 'Unknown Location';

                setLocationState(detectedState);
                setLocationName(`${detectedCity}, ${detectedState}`);
            } catch (error) {
                console.error("Reverse geocoding failed", error);
                // Fallback
                setLocationName("Uttar Pradesh (Fallback)");
                fetchMarketSnapshot('Uttar Pradesh');
            } finally {
                setIsLocating(false);
            }
        }, (error) => {
            console.error("Geolocation error:", error);
            setIsLocating(false);
            // Fallback
            setLocationName("Prayagraj (Default)");
            fetchMarketSnapshot('Uttar Pradesh');
        });
    };

    const fetchMarketSnapshot = async (state: string) => {
        setLoading(true);
        try {
            const res = await fetch(`http://localhost:3000/api/market/snapshot?state=${encodeURIComponent(state)}`);
            const data = await res.json();
            if (data.success) {
                setOverview(data.data);
            }
        } catch (error) {
            console.error("Failed to fetch market snapshot", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setIsSearching(true);
        try {
            const res = await fetch(`http://localhost:3000/api/market/search?q=${searchQuery}&state=${encodeURIComponent(locationState)}`);
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.data);
            }
        } catch (error) {
            console.error("Search failed", error);
        }
    };

    const renderCropCard = (crop: MarketPrice, index: number) => (
        <div key={`${crop.commodity}-${index}`} className="min-w-[160px] bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-2 opacity-5 group-hover:opacity-10 transition-opacity">
                <Activity size={40} />
            </div>

            <div>
                <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider truncate max-w-[80px]" title={crop.market}>{crop.market}</span>
                    <span className={`text-xs font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${crop.trend === 'GROWING' ? 'bg-green-100 text-green-700' :
                        crop.trend === 'DEPRECIATING' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                        {crop.trend === 'GROWING' ? <TrendingUp size={10} /> : crop.trend === 'DEPRECIATING' ? <TrendingDown size={10} /> : '-'}
                    </span>
                </div>
                <h3 className="font-bold text-gray-900 truncate" title={crop.commodity}>{crop.commodity}</h3>
                <p className="text-xs text-gray-500 truncate">{new Date(crop.date).toLocaleDateString()}</p>
            </div>

            <div className="mt-3">
                <div className="flex items-baseline gap-1">
                    <p className="text-lg font-black text-gray-900">₹{crop.modalPrice}</p>
                </div>
                <p className="text-xs text-gray-400">per quintal</p>
            </div>
        </div>
    );

    const renderSection = (title: string, icon: React.ReactNode, data: MarketPrice[], color: string) => {
        if (!data || data.length === 0) return null;

        return (
            <div className="mb-8">
                <div className="flex items-center gap-2 mb-4 px-6">
                    <div className={`p-2 rounded-lg ${color} text-white`}>
                        {icon}
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{title}</h2>
                </div>
                <div className="flex overflow-x-auto pb-4 gap-4 px-6 snap-x">
                    {data.map((crop, i) => (
                        <div key={i} className="snap-start contents">
                            {renderCropCard(crop, i)}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            {/* Header & Search */}
            <div className="sticky top-0 bg-gray-50/95 backdrop-blur-sm z-10 pt-6 px-6 pb-4 border-b border-gray-100">
                <div className="flex justify-between items-end mb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Marketplace</h1>
                        <button
                            onClick={detectLocation}
                            className="text-gray-500 text-sm font-medium mt-1 flex items-center gap-1 hover:text-green-600 transition-colors"
                        >
                            <MapPin size={14} className={isLocating ? "animate-bounce" : ""} />
                            {isLocating ? "Detecting location..." : `${locationName} (Live)`}
                            <RefreshCw size={12} className="ml-1 opacity-50" />
                        </button>
                    </div>
                </div>

                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search crops (e.g. Potato, Wheat)..."
                        className="w-full bg-white border border-gray-200 text-gray-900 rounded-2xl py-3 pl-12 pr-4 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500 transition-all font-medium placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Search className="absolute left-4 top-3.5 text-gray-400" size={20} />
                </div>
            </div>

            {/* Content */}
            <div className="pt-4 space-y-2">
                {isSearching ? (
                    <div className="px-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Search Results</h2>
                        {searchResults.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4">
                                {searchResults.map((crop, i) => renderCropCard(crop, i))}
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-400">
                                <p>{searchQuery ? 'No crops found.' : 'Type to search...'}</p>
                            </div>
                        )}
                    </div>
                ) : loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                    </div>
                ) : overview ? (
                    <>
                        {renderSection("Growing Fast", <TrendingUp size={20} />, overview.trending, "bg-green-500")}
                        {renderSection("All Time Best", <Award size={20} />, overview.allTimeBest, "bg-yellow-500")}
                        {renderSection("High Demand", <Activity size={20} />, overview.highDemand, "bg-blue-500")}
                        {renderSection("Depreciating", <TrendingDown size={20} />, overview.depreciating, "bg-red-500")}

                        <div className="px-6 py-4">
                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-lg mb-1">Need specific insights?</h3>
                                    <p className="text-indigo-100 text-sm mb-3">Get detailed price forecasts for your upcoming harvest.</p>
                                    <button className="bg-white text-indigo-600 px-4 py-2 rounded-lg text-sm font-bold shadow-sm active:scale-95 transition-transform">
                                        Analyze Profit
                                    </button>
                                </div>
                                <div className="absolute -bottom-8 -right-8 opacity-20 rotate-12">
                                    <Activity size={150} />
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="text-center text-gray-400 py-10 px-6">
                        <p className="mb-2">Failed to load market data for {locationState}.</p>
                        <button onClick={() => fetchMarketSnapshot(locationState)} className="text-green-600 font-bold hover:underline">Retry</button>
                    </div>
                )}
            </div>


        </div>
    );
};

export default Marketplace;
