
import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProfitPerDropChart } from '../components/ProfitPerDropChart';
import { Sprout, BarChart2, RefreshCw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const ProfitAnalysis: React.FC = () => {
    const { t } = useLanguage();
    const [loading, setLoading] = useState(false);
    const [comparisonData, setComparisonData] = useState<any[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [selectedCrop, setSelectedCrop] = useState<string>('sugarcane_1'); // Default but changeable

    const handleAnalysis = async () => {
        setLoading(true);
        setError(null);
        try {
            console.log("Fetching comparison data for:", selectedCrop);
            const res = await fetch('http://localhost:3000/api/inference/compare-crops', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cropIds: [selectedCrop, 'gram_chana', 'wheat_lokwan', 'cotton_bt', 'soybean_js335', 'onion_red', 'tomato_hybrid'],
                    farmContext: {
                        pincode: '413709', // Specific for demo (Western Maharashtra)
                        lat: 19.1,
                        lon: 74.5,
                        soilType: 'Black'
                    }
                })
            });

            if (!res.ok) throw new Error(`API Error: ${res.status}`);

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

    // Auto-load on mount or change
    useEffect(() => {
        handleAnalysis();
    }, [selectedCrop]);

    return (
        <div className="pb-24 pt-6 px-4 space-y-6">
            <header>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BarChart2 className="text-blue-600" />
                    Profit Analysis
                </h1>
                <p className="text-gray-500 text-sm mt-1">Smart crop planning & water economics</p>
            </header>

            {/* Selection Controls */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comparing against your planned crop:
                </label>
                <div className="flex gap-2">
                    <select
                        value={selectedCrop}
                        onChange={(e) => setSelectedCrop(e.target.value)}
                        className="flex-1 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
                    >
                        <option value="sugarcane_1">Sugarcane (Adsali)</option>
                        <option value="cotton_bt">Bt Cotton</option>
                        <option value="wheat_lokwan">Wheat (Lokwan)</option>
                        <option value="gram_chana">Gram (Chana)</option>
                        <option value="soybean_js335">Soybean (JS-335)</option>
                        <option value="onion_red">Red Onion</option>
                        <option value="tomato_hybrid">Tomato (Hybrid)</option>
                    </select>
                    <button
                        onClick={handleAnalysis}
                        className="bg-blue-600 text-white p-2.5 rounded-lg hover:bg-blue-700 transition"
                    >
                        <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">
                    Error: {error}
                </div>
            )}

            {/* Loading State */}
            {loading && !comparisonData.length && (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
                    <p>Crunching numbers...</p>
                </div>
            )}

            {/* Results */}
            {!loading && comparisonData.length > 0 && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ProfitPerDropChart crops={comparisonData} userIntent={selectedCrop} />
                </div>
            )}
        </div>
    );
};

export default ProfitAnalysis;
