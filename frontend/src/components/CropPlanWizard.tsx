import React, { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { ChevronRight, Sprout, Droplets, TrendingUp, Loader2, X } from 'lucide-react';

interface CropPlanWizardProps {
    isOpen: boolean;
    onClose: () => void;
    currentFarmArea?: number;
    currentPincode?: string;
    onApplyParams: (params: any) => Promise<any>;
}

interface Recommendation {
    cropId: string;
    name: string;
    profitIndex: number;
    waterSavings: number;
    viabilityScore: number;
    isSmartSwap: boolean;
    reason: string[];
    impact?: {
        totalLiters: number;
        drinkingWaterDays: number;
        pondsFilled: number;
        extraAcres: number;
        comparison?: {
            intentCropName: string;
            intentWaterMm: number;
            intentProfitIndex: number;
            recommendedProfitIndex: number;
        };
    };
}

const CropPlanWizard: React.FC<CropPlanWizardProps> = ({ isOpen, onClose, currentFarmArea, onApplyParams }) => {
    const { t } = useLanguage();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Recommendation[] | null>(null);

    // Form State
    const [pincode, setPincode] = useState('');
    const [previousCrop, setPreviousCrop] = useState('');
    const [plannedCrop, setPlannedCrop] = useState('');

    if (!isOpen) return null;

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const data = await onApplyParams({
                pincode,
                previousCropId: previousCrop,
                userIntentCropId: plannedCrop,
                totalLandArea: currentFarmArea
            });

            if (data && data.recommendations) {
                setResults(data.recommendations);
                setStep(2);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to analyze. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Helper to determine if we show the victory card
    const shouldShowVictoryCard = () => {
        if (!results || results.length === 0) return false;
        const topResult = results[0];
        // Must be smart swap AND have impact data
        return topResult.isSmartSwap && !!topResult.impact;
    };

    const showVictoryCard = shouldShowVictoryCard();

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Sprout size={24} />
                        </div>
                        <span className="text-blue-100 text-xs font-bold uppercase tracking-wider border border-blue-400/30 px-2 py-0.5 rounded">
                            Hydro-Eco Engine
                        </span>
                    </div>
                    <h2 className="text-2xl font-bold">
                        {step === 1 ? t('wizard.step1_title') : t('wizard.step2_title')}
                    </h2>
                    <p className="text-blue-100 opacity-90 text-sm mt-1 leading-relaxed">
                        {step === 1 ? t('wizard.step1_desc') : t('wizard.step2_desc')}
                    </p>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto hide-scrollbar grow">
                    {step === 1 && (
                        <div className="space-y-6">
                            {/* Q1: Location */}
                            <div className="animate-slide-up" style={{ animationDelay: '0ms' }}>
                                <label className="text-sm font-bold text-gray-700 block mb-2">{t('wizard.pincode_label')}</label>
                                <input
                                    type="text"
                                    value={pincode}
                                    onChange={(e) => setPincode(e.target.value)}
                                    placeholder="e.g. 411001"
                                    className="w-full p-4 bg-gray-50 rounded-2xl font-bold text-gray-900 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1 ml-1">Used to determine Agro-Climatic Zone</p>
                            </div>

                            {/* Q2: Previous Crop */}
                            <div className="animate-slide-up" style={{ animationDelay: '100ms' }}>
                                <label className="text-sm font-bold text-gray-700 block mb-2">{t('wizard.prev_crop_label')}</label>
                                <input
                                    list="crop-options"
                                    type="text"
                                    value={previousCrop}
                                    onChange={(e) => setPreviousCrop(e.target.value)}
                                    placeholder="Type to search (e.g. Cotton, Wheat)"
                                    className="w-full p-4 bg-gray-50 rounded-2xl font-semibold text-gray-900 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                            </div>

                            {/* Q3: User Intent */}
                            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
                                <label className="text-sm font-bold text-gray-700 block mb-2">{t('wizard.intent_label')}</label>
                                <input
                                    list="crop-options"
                                    type="text"
                                    value={plannedCrop}
                                    onChange={(e) => setPlannedCrop(e.target.value)}
                                    placeholder="e.g. Sugarcane"
                                    className="w-full p-4 bg-gray-50 rounded-2xl font-semibold text-gray-900 border-none focus:ring-2 focus:ring-blue-500 outline-none"
                                />
                                <p className="text-xs text-gray-400 mt-1 ml-1">{t('wizard.intent_hint')}</p>
                            </div>

                            <datalist id="crop-options">
                                <option value="Sugarcane" />
                                <option value="Cotton" />
                                <option value="Soybean" />
                                <option value="Wheat" />
                                <option value="Onion" />
                                <option value="Tomato" />
                                <option value="Gram (Chana)" />
                                <option value="Turmeric" />
                                <option value="Ginger" />
                                <option value="Maize" />
                                <option value="Rice" />
                                <option value="Pomegranate" />
                                <option value="Grapes" />
                            </datalist>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 pb-4">
                            {(!results || results.length === 0) && (
                                <div className="text-center py-10 text-gray-500">
                                    No crops found for this area.
                                </div>
                            )}

                            {results && results.length > 0 && (
                                <>
                                    {/* 1. VICTORY CARD (Conditional) */}
                                    {showVictoryCard && results[0].impact && (
                                        <div className="bg-gradient-to-br from-green-600 to-emerald-800 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-10 -mt-10 blur-3xl"></div>
                                            <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/20 rounded-full -ml-10 -mb-10 blur-2xl"></div>

                                            <div className="relative z-10">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/20 shadow-sm">
                                                        🎉 Smart Swap
                                                    </span>
                                                </div>

                                                {/* COMPARISON HEADER */}
                                                <div className="mb-6">
                                                    <div className="flex items-center gap-3 opacity-90 text-sm mb-1">
                                                        <span className="line-through decoration-red-400/80 text-white/60">
                                                            {results[0].impact.comparison?.intentCropName || plannedCrop}
                                                        </span>
                                                        <ChevronRight size={14} className="text-white/40" />
                                                        <span className="font-bold text-yellow-300 text-lg">
                                                            {results[0].name}
                                                        </span>
                                                    </div>
                                                    <div className="text-xs text-white/50 leading-tight">
                                                        Switching to {results[0].name} is a smarter choice for your area.
                                                    </div>
                                                </div>

                                                {/* METRICS GRID */}
                                                <div className="grid grid-cols-2 gap-3 mb-4">
                                                    {/* Water Metric */}
                                                    <div className="bg-black/20 rounded-2xl p-3 backdrop-blur-sm border border-white/10">
                                                        <p className="text-emerald-200 text-[10px] font-bold uppercase tracking-wider mb-1">Water Saved</p>
                                                        <div className="text-2xl font-bold tracking-tight">
                                                            {results[0].impact.totalLiters.toLocaleString()} <span className="text-xs opacity-70 font-normal">L</span>
                                                        </div>
                                                        <div className="text-[10px] text-white/60 mt-1">
                                                            vs {results[0].impact.comparison?.intentCropName}
                                                        </div>
                                                    </div>

                                                    {/* Profit Metric (REQUESTED) */}
                                                    <div className="bg-white/10 rounded-2xl p-3 backdrop-blur-sm border border-white/10">
                                                        <p className="text-yellow-200 text-[10px] font-bold uppercase tracking-wider mb-1">Profit Efficiency</p>
                                                        <div className="text-2xl font-bold tracking-tight">
                                                            ₹{results[0].profitIndex} <span className="text-xs opacity-70 font-normal">/mm</span>
                                                        </div>
                                                        <div className="text-[10px] text-white/60 mt-1">
                                                            {results[0].impact.comparison ? (
                                                                <>
                                                                    vs ₹{results[0].impact.comparison.intentProfitIndex} ({(results[0].profitIndex / Math.max(1, results[0].impact.comparison.intentProfitIndex)).toFixed(1)}x)
                                                                </>
                                                            ) : 'High Efficiency'}
                                                        </div>
                                                    </div>
                                                </div>

                                                <ul className="space-y-2">
                                                    <li className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                                                        <div className="bg-cyan-400/20 p-1.5 rounded-md text-cyan-200"><Droplets size={14} /></div>
                                                        <span className="text-xs text-white/80">Fills your Farm Pond <strong className="text-white">{results[0].impact.pondsFilled} times</strong></span>
                                                    </li>
                                                    <li className="flex items-center gap-3 bg-white/5 p-2 rounded-lg border border-white/5">
                                                        <div className="bg-green-400/20 p-1.5 rounded-md text-green-200"><Sprout size={14} /></div>
                                                        <span className="text-xs text-white/80">Irrigates <strong className="text-white">{results[0].impact.extraAcres} extra acres</strong></span>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    )}

                                    {/* 2. LIST HEADER */}
                                    <h3 className="text-lg font-bold text-gray-900 px-2 flex items-center gap-2 mt-4">
                                        {showVictoryCard ? "Other Recommendations" : "Your Recommendations"}
                                        <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full">{results.length} Crops</span>
                                    </h3>

                                    {/* 3. LIST ITEMS */}
                                    <div className="space-y-4">
                                        {results.map((crop, idx) => {
                                            // If we showed the victory card, SKIP the first item (because it's inside the card)
                                            if (showVictoryCard && idx === 0) return null;

                                            return (
                                                <div key={idx} className="relative p-5 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm transition-all active:scale-[0.99]">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h3 className="text-lg font-bold text-gray-900">{crop.name}</h3>
                                                            <div className="flex gap-2 mt-1">
                                                                {crop.reason.map((r, i) => (
                                                                    <span key={i} className="text-[10px] font-bold bg-green-50 text-green-700 px-2 py-0.5 rounded border border-green-100">{r}</span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <span className="block text-2xl font-black text-gray-900 tracking-tight">{crop.viabilityScore}%</span>
                                                        </div>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2 mt-2">
                                                        <div className="bg-blue-50 p-2.5 rounded-xl border border-blue-100/50">
                                                            <div className="flex items-center gap-1.5 text-blue-800 mb-0.5">
                                                                <Droplets size={14} />
                                                                <span className="text-[10px] font-bold uppercase">Water Impact</span>
                                                            </div>
                                                            <span className={`text-sm font-bold ${crop.waterSavings > 0 ? 'text-green-600' : 'text-orange-500'}`}>
                                                                {crop.waterSavings > 0 ? `Saves ${crop.waterSavings}%` : 'Standard Use'}
                                                            </span>
                                                        </div>
                                                        <div className="bg-purple-50 p-2.5 rounded-xl border border-purple-100/50">
                                                            <div className="flex items-center gap-1.5 text-purple-800 mb-0.5">
                                                                <TrendingUp size={14} />
                                                                <span className="text-[10px] font-bold uppercase">Profit Index</span>
                                                            </div>
                                                            <span className="text-sm font-bold text-gray-900">
                                                                ₹{crop.profitIndex}<span className="text-[10px] text-gray-500">/mm</span>
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 bg-gray-50 border-t border-gray-100 shrink-0">
                    {step === 1 ? (
                        <button
                            onClick={handleAnalyze}
                            disabled={!pincode || loading}
                            className="w-full py-4 bg-black text-white font-bold text-lg rounded-2xl shadow-xl shadow-gray-400/50 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Running Engine...
                                </>
                            ) : (
                                <>
                                    Analyze Farm <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    ) : (
                        <button
                            onClick={onClose}
                            className="w-full py-4 bg-gray-900 text-white font-bold text-lg rounded-2xl shadow-lg active:scale-95 transition-all"
                        >
                            Done
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CropPlanWizard;
