
import React, { useState, useEffect } from 'react';
import { ProfitPerDropChart } from '../components/ProfitPerDropChart';
import { BarChart2, RefreshCw, X, AlertCircle } from 'lucide-react';


interface CropOption {
    id: string;
    name: string;
    category?: string;
}

const ProfitAnalysis: React.FC = () => {

    const [loading, setLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);

    // State for crop selection
    const [allCrops, setAllCrops] = useState<CropOption[]>([]);
    const [selectedCrops, setSelectedCrops] = useState<string[]>(['sugarcane_1', 'cotton_bt', 'soybean_js335']); // Default selection
    const [searchQuery, setSearchQuery] = useState('');
    const [cropsLoading, setCropsLoading] = useState(true);

    // Fetch available crops list on mount
    useEffect(() => {
        const fetchCrops = async () => {
            try {
                // We use market-prices endpoint to get the list of supported crops
                // Use a default district to get the list
                const res = await fetch('http://localhost:3000/api/inference/market-prices?district=Ahmednagar');
                const data = await res.json();

                if (data.success && data.prices) {
                    const mappedCrops = data.prices.map((p: any) => ({
                        id: p.cropId,
                        name: p.cropName
                    }));
                    setAllCrops(mappedCrops);
                }
            } catch (e) {
                console.error("Failed to fetch crop list", e);
                // Fallback list if API fails
                setAllCrops([
                    { id: 'sugarcane_1', name: 'Sugarcane (Adsali)' },
                    { id: 'cotton_bt', name: 'Bt Cotton' },
                    { id: 'wheat_lokwan', name: 'Wheat (Lokwan)' },
                    { id: 'gram_chana', name: 'Gram (Chana)' },
                    { id: 'soybean_js335', name: 'Soybean (JS-335)' },
                    { id: 'onion_red', name: 'Red Onion' },
                    { id: 'tomato_hybrid', name: 'Tomato (Hybrid)' },
                    { id: 'maize_kharif', name: 'Maize (Kharif)' },
                    { id: 'pomegranate_bhagwa', name: 'Pomegranate (Bhagwa)' }
                ]);
            } finally {
                setCropsLoading(false);
            }
        };
        fetchCrops();
    }, []);

    const handleAnalysis = async () => {
        if (selectedCrops.length < 2) {
            setError("Please select at least 2 crops to compare.");
            return;
        }

        setLoading(true);
        setError(null);
        try {
            console.log("Fetching comparison data for:", selectedCrops);
            const res = await fetch('http://localhost:3000/api/inference/compare-crops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cropIds: selectedCrops,
                    farmContext: {
                        pincode: '413709', // Specific for demo (Western Maharashtra)
                        lat: 19.1,
                        lon: 74.5,
                        soilType: 'Black'
                    }
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.error || `API Error: ${res.status}`);
            }

            const data = await res.json();
            if (data.success && data.comparison) {
                setComparisonData(data.comparison);
            } else {
                setError(data.error || "No comparison data found");
            }
        } catch (err: any) {
            console.error("Analysis failed", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Auto-load when selection changes (with debounce could be better, but direct is fine for now)
    // Actually, let's make it manual with a button to avoid spamming while selecting
    // useEffect(() => { if(selectedCrops.length >= 2) handleAnalysis(); }, [selectedCrops]); 
    // Manual trigger is better for UX when selecting multiple items.

    const toggleCrop = (cropId: string) => {
        if (selectedCrops.includes(cropId)) {
            setSelectedCrops(prev => prev.filter(c => c !== cropId));
        } else {
            if (selectedCrops.length >= 5) {
                // Optional: Show toast or alert
                alert("You can compare up to 5 crops at a time.");
                return;
            }
            setSelectedCrops(prev => [...prev, cropId]);
        }
    };

    return (
        <div className="pb-24 pt-6 px-4 space-y-6">
            {/* Simple Light Theme Header */}
            <header className="mb-6 bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <BarChart2 size={24} />
                        </span>
                        Profit Analysis
                        <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-2 py-1 rounded-full border border-yellow-200 uppercase tracking-widest">
                            GOLD TIER
                        </span>
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 ml-12">
                        Advanced economic simulation & market risk assessment.
                    </p>
                </div>
            </header>

            {/* Selection Controls */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-4">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700">
                        Select Crops to Compare (Max 5)
                    </label>
                    <span className="text-xs text-gray-500">{selectedCrops.length}/5 selected</span>
                </div>

                {/* Selected Chips */}
                <div className="flex flex-wrap gap-2 min-h-[40px] p-2 bg-gray-50 rounded-lg border border-gray-200">
                    {selectedCrops.length === 0 && <span className="text-gray-400 text-sm italic p-1">No crops selected</span>}
                    {selectedCrops.map(id => {
                        const crop = allCrops.find(c => c.id === id);
                        return (
                            <div key={id} className="flex items-center gap-1 bg-white border border-blue-200 text-blue-800 text-sm px-3 py-1 rounded-full shadow-sm animate-in fade-in zoom-in duration-200">
                                <span>{crop?.name || id}</span>
                                <button onClick={() => toggleCrop(id)} className="hover:bg-blue-50 rounded-full p-0.5 transition">
                                    <X size={14} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Dropdown / list of available crops */}
                {/* Search Input */}
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Search crops..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                    <div className="absolute left-3 top-2.5 text-gray-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                </div>

                {/* Dropdown / list of available crops */}
                <div className="relative">
                    {cropsLoading ? (
                        <div className="text-sm text-gray-500 animate-pulse">Loading crop database...</div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-100 rounded-lg custom-scrollbar">
                            {allCrops
                                .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(crop => {
                                    const isSelected = selectedCrops.includes(crop.id);
                                    return (
                                        <button
                                            key={crop.id}
                                            onClick={() => toggleCrop(crop.id)}
                                            disabled={!isSelected && selectedCrops.length >= 5}
                                            className={`text-left text-xs px-3 py-2 rounded-md transition-all ${isSelected
                                                ? 'bg-blue-600 text-white shadow-md'
                                                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200'
                                                } ${(!isSelected && selectedCrops.length >= 5) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        >
                                            <div className="font-medium truncate">{crop.name}</div>
                                        </button>
                                    );
                                })}
                            {allCrops.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                                <div className="col-span-full text-center text-gray-400 py-4 text-sm">
                                    No crops match your search
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-end pt-2">
                    <button
                        onClick={handleAnalysis}
                        disabled={selectedCrops.length < 2 || loading}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-all ${selectedCrops.length < 2
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl active:scale-95'
                            }`}
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                        {loading ? 'Analyzing...' : 'Run Comparison'}
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                    <AlertCircle size={18} />
                    {error}
                </div>
            )}

            {/* Loading State */}
            {loading && !comparisonData.length && (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
                    <p className="animate-pulse">Simulating farm conditions & market risks...</p>
                </div>
            )}

            {/* Results */}
            {!loading && comparisonData.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <ProfitPerDropChart crops={comparisonData} userIntent={selectedCrops[0] || ""} />
                </div>
            )}
        </div>
    );
};

export default ProfitAnalysis;
