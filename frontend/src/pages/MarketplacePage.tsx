import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, TrendingDown, Flame, Award, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';

interface CropPrice {
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
    trending: CropPrice[];
    allTimeBest: CropPrice[];
    depreciating: CropPrice[];
    highDemand: CropPrice[];
    allCrops: CropPrice[];
    lastUpdated: string;
}

const MarketplacePage: React.FC = () => {
    const [snapshot, setSnapshot] = useState<MarketSnapshot | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<CropPrice[]>([]);
    const [activeTab, setActiveTab] = useState<'trending' | 'best' | 'depreciating' | 'demand'>('trending');
    const [loading, setLoading] = useState(true);

    // Fetch market snapshot
    useEffect(() => {
        fetchMarketData();
        const interval = setInterval(fetchMarketData, 5 * 60 * 1000); // Refresh every 5 min
        return () => clearInterval(interval);
    }, []);

    const fetchMarketData = async () => {
        try {
            const res = await fetch('http://localhost:3000/api/market/snapshot');
            const data = await res.json();
            if (data.success) {
                setSnapshot(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch market data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Search crops
    const handleSearch = async (query: string) => {
        setSearchQuery(query);

        if (query.length < 2) {
            setSearchResults([]);
            // The original instruction had a line `const res = await fetch(`${API_BASE_URL}/api/market/snapshot`);` here.
            // This line seems misplaced as it would fetch snapshot data when the search query is too short,
            // which is not the typical behavior for a search input clearing.
            // Assuming the intent was to update the API_BASE_URL for the *actual* search call,
            // and not to introduce a new snapshot fetch here.
            // If the intent was to re-fetch snapshot data, please clarify.
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/market/search?q=${encodeURIComponent(query)}`);
            const data = await res.json();
            if (data.success) {
                setSearchResults(data.data);
            }
        } catch (error) {
            console.error('Search failed:', error);
        }
    };

    const getCategoryData = () => {
        if (!snapshot) return [];
        switch (activeTab) {
            case 'trending': return snapshot.trending;
            case 'best': return snapshot.allTimeBest;
            case 'depreciating': return snapshot.depreciating;
            case 'demand': return snapshot.highDemand;
            default: return [];
        }
    };

    const displayData = searchQuery.length >= 2 ? searchResults : getCategoryData();

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading market prices...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 pb-24">

            {/* Header */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 text-white px-6 pt-6 pb-8 rounded-b-3xl shadow-lg">
                <h1 className="text-2xl font-bold mb-2">Market & Prices</h1>
                <p className="text-green-100 text-sm">Live mandi rates updated hourly</p>

                {snapshot && (
                    <p className="text-xs text-green-200 mt-2">
                        Last updated: {new Date(snapshot.lastUpdated).toLocaleTimeString()}
                    </p>
                )}
            </div>

            {/* Search Bar */}
            <div className="px-6 -mt-6 relative z-10">
                <div className="bg-white rounded-2xl shadow-md p-4 flex items-center gap-3">
                    <Search size={20} className="text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search crops (wheat, cotton, tomato...)"
                        value={searchQuery}
                        onChange={(e) => handleSearch(e.target.value)}
                        className="flex-1 outline-none text-gray-700 w-full"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => handleSearch('')}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            ✕
                        </button>
                    )}
                </div>
            </div>

            {/* Category Tabs */}
            {!searchQuery && (
                <div className="px-6 mt-6 flex gap-2 overflow-x-auto pb-2">
                    <button
                        onClick={() => setActiveTab('trending')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeTab === 'trending'
                            ? 'bg-green-600 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                    >
                        <TrendingUp size={16} />
                        Growing
                    </button>

                    <button
                        onClick={() => setActiveTab('best')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeTab === 'best'
                            ? 'bg-yellow-500 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                    >
                        <Award size={16} />
                        All-Time Best
                    </button>

                    <button
                        onClick={() => setActiveTab('depreciating')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeTab === 'depreciating'
                            ? 'bg-red-500 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                    >
                        <TrendingDown size={16} />
                        Depreciating
                    </button>

                    <button
                        onClick={() => setActiveTab('demand')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${activeTab === 'demand'
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-white text-gray-700 border border-gray-200'
                            }`}
                    >
                        <Flame size={16} />
                        High Demand
                    </button>
                </div>
            )}

            {/* Results Header */}
            <div className="px-6 mt-6">
                <h2 className="text-lg font-semibold text-gray-800">
                    {searchQuery
                        ? `Search Results (${displayData.length})`
                        : activeTab === 'trending' ? 'Growing Prices 📈'
                            : activeTab === 'best' ? 'Highest Value Crops 🏆'
                                : activeTab === 'depreciating' ? 'Falling Prices 📉'
                                    : 'High Demand Crops 🔥'
                    }
                </h2>
            </div>

            {/* Crop List */}
            <div className="px-6 mt-4 space-y-3">
                {displayData.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No crops found</p>
                    </div>
                ) : (
                    displayData.map((crop, index) => (
                        <CropCard key={index} crop={crop} />
                    ))
                )}
            </div>

            {/* Show All Button */}
            {!searchQuery && snapshot && (
                <div className="px-6 mt-6 mb-10">
                    <button
                        onClick={() => handleSearch('a')} // Trigger search to show all
                        className="w-full bg-white border-2 border-green-600 text-green-600 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
                    >
                        View All {snapshot.allCrops.length} Crops
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================================================
// CROP CARD COMPONENT
// ============================================================================

const CropCard: React.FC<{ crop: CropPrice }> = ({ crop }) => {
    const trendColor =
        crop.trend === 'GROWING' ? 'text-green-600' :
            crop.trend === 'DEPRECIATING' ? 'text-red-600' :
                'text-gray-600';

    const trendIcon =
        crop.trend === 'GROWING' ? <TrendingUp size={16} /> :
            crop.trend === 'DEPRECIATING' ? <TrendingDown size={16} /> :
                null;

    const demandBadge = crop.demand === 'HIGH' ? (
        <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-medium">
            🔥 High Demand
        </span>
    ) : null;

    return (
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 text-lg">{crop.commodity}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        {crop.market}, {crop.state}
                    </p>
                </div>

                <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                        ₹{crop.modalPrice}
                    </div>
                    <p className="text-xs text-gray-500">/quintal</p>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    {crop.changePercent !== 0 && (
                        <div className={`flex items-center gap-1 ${trendColor}`}>
                            {trendIcon}
                            <span className="text-sm font-medium">
                                {crop.changePercent > 0 ? '+' : ''}{crop.changePercent}%
                            </span>
                        </div>
                    )}

                    {demandBadge}
                </div>

                <button className="text-green-600 hover:text-green-700 flex items-center gap-1">
                    <span className="text-sm font-medium">Details</span>
                    <ChevronRight size={16} />
                </button>
            </div>

            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                <span>Min: ₹{crop.minPrice?.toFixed(0) || 'N/A'}</span>
                <span>Max: ₹{crop.maxPrice?.toFixed(0) || 'N/A'}</span>
                <span>Arrival: {(crop.arrivalQuantity / 1000).toFixed(1)}t</span>
            </div>
        </div>
    );
};

export default MarketplacePage;
