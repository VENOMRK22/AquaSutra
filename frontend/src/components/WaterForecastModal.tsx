import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { X, CloudRain, AlertOctagon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

interface SimulationData {
    day: number;
    date: string;
    balance_mm: number;
    rain_mm: number;
    et_mm: number;
    status: string;
}

interface ForecastConfig {
    soilCapacity_mm: number;
    wiltingPoint_mm: number;
    selectedCrop: string;
    kc_peak: number;
}

interface ForecastResponse {
    simulation: SimulationData[];
    summary: {
        totalRain: number;
        totalConsumption: number;
        daysStress: number;
        daysRunoff: number;
        firstStressDay: number | null;
        finalBalance: number;
    };
    config: ForecastConfig;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    lat: number;
    lon: number;
    crop?: {
        name: string;
        crop_type: string; // Water Category
        soil_type: string;
        area: number;
    } | null;
}

const WaterForecastModal: React.FC<Props> = ({ isOpen, onClose, lat, lon, crop }) => {
    const { t } = useLanguage();
    const [data, setData] = useState<ForecastResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedCrop, setSelectedCrop] = useState(crop?.crop_type || 'High'); // Default to passed crop type
    const [dripEnabled, setDripEnabled] = useState(false);
    const [mulchEnabled, setMulchEnabled] = useState(false);

    useEffect(() => {
        if (crop) setSelectedCrop(crop.crop_type);
    }, [crop]);

    useEffect(() => {
        if (isOpen && lat && lon) {
            fetchForecast();
        }
    }, [isOpen, lat, lon, selectedCrop, dripEnabled, mulchEnabled]);

    const fetchForecast = async () => {
        setLoading(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            const interventions = [];
            if (dripEnabled) interventions.push('drip');
            if (mulchEnabled) interventions.push('mulch');

            console.log(`Fetching forecast for ${selectedCrop} with [${interventions.join(',')}]`);

            const res = await fetch(`/api/water/forecast?lat=${lat}&lon=${lon}&crop=${selectedCrop}&interventions=${interventions.join(',')}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();

            if (json.error) throw new Error(json.error);
            setData(json);
        } catch (err) {
            console.error("Forecast fetch error:", err);
            setData(null);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    // Crop Categories as per User Request
    const cropCategories = [
        { id: 'Very Low', label: 'Very Low Use', example: 'Millet, Bajra' },
        { id: 'Low', label: 'Low Use', example: 'Groundnut, Pulses' },
        { id: 'Moderate', label: 'Moderate Use', example: 'Wheat, Cotton' },
        { id: 'High', label: 'High Use', example: 'Sugarcane, Rice' }
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />

            {/* Modal Card (Full screen on mobile, card on desktop) */}
            <div className="relative bg-ios-bg w-full sm:max-w-md h-[95vh] sm:h-[85vh] rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col animate-slide-up">

                {/* Header */}
                <div className="p-5 flex justify-between items-center bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                            {crop?.name || t('forecast.title')}
                        </h2>
                        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mt-1">
                            {crop && (
                                <>
                                    <span className="bg-gray-100 px-2 py-0.5 rounded-md text-gray-700">{crop.area} ac</span>
                                    <span className="bg-stone-100 px-2 py-0.5 rounded-md text-stone-600">{crop.soil_type || 'Soil'}</span>
                                </>
                            )}
                            <span>{t('forecast.180_day_plan')}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 bg-gray-100 rounded-full active:bg-gray-200 transition-colors">
                        <X size={20} className="text-gray-600" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar pb-10">
                    <div className="p-5 space-y-6">

                        {/* Crop Category Selector */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">{t('forecast.water_category')}</label>
                            <div className="grid grid-cols-2 gap-2">
                                {cropCategories.map(c => (
                                    <button
                                        key={c.id}
                                        onClick={() => setSelectedCrop(c.id)}
                                        className={`py-3 px-3 rounded-xl text-left transition-all border ${selectedCrop === c.id
                                            ? 'bg-blue-50 border-blue-200 ring-1 ring-blue-500 shadow-sm'
                                            : 'bg-gray-50 border-transparent hover:bg-gray-100'
                                            }`}
                                    >
                                        <div className={`text-xs font-bold mb-0.5 ${selectedCrop === c.id ? 'text-blue-700' : 'text-gray-700'}`}>{c.label}</div>
                                        <div className="text-[10px] text-gray-400 truncate">{c.example}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Intervention Toggles (Feature #2) */}
                        <div className="bg-white p-4 rounded-2xl shadow-sm">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 block">{t('forecast.interventions')}</label>
                            <div className="space-y-3">
                                {/* Drip Toggle */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${dripEnabled ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <CloudRain size={18} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{t('forecast.drip_irrigation')}</p>
                                            <p className="text-[10px] text-green-600 font-medium">{t('forecast.saves_40')}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setDripEnabled(!dripEnabled)}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${dripEnabled ? 'bg-blue-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${dripEnabled ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>

                                {/* Mulch Toggle */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${mulchEnabled ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400'}`}>
                                            <div className="w-4 h-4 border-b-2 border-current" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-gray-800">{t('forecast.mulching')}</p>
                                            <p className="text-[10px] text-green-600 font-medium">{t('forecast.saves_20')}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setMulchEnabled(!mulchEnabled)}
                                        className={`w-11 h-6 rounded-full transition-colors relative ${mulchEnabled ? 'bg-amber-500' : 'bg-gray-300'}`}
                                    >
                                        <div className={`absolute top-1 left-1 bg-white w-4 h-4 rounded-full transition-transform ${mulchEnabled ? 'translate-x-5' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="h-64 flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl shadow-sm">
                                <div className="w-8 h-8 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mb-3"></div>
                                <span className="text-sm">{t('forecast.running_model')}</span>
                            </div>
                        ) : data ? (
                            <>
                                {/* Graph Card */}
                                <div className="bg-white p-2 rounded-3xl shadow-ios-lg">
                                    <div className="h-64 w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={data.simulation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                <defs>
                                                    <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#007AFF" stopOpacity={0.3} />
                                                        <stop offset="95%" stopColor="#007AFF" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                                <XAxis dataKey="day" hide />
                                                <YAxis hide domain={[0, data.config.soilCapacity_mm + 20]} />
                                                <Tooltip
                                                    labelFormatter={(d) => `Day ${d}`}
                                                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', fontWeight: 500 }}
                                                />
                                                {/* Soil Capacity (Max) */}
                                                <ReferenceLine y={data.config.soilCapacity_mm} stroke="#34C759" strokeDasharray="4 4" label={{ position: 'insideTopRight', value: `Max: ${data.config.soilCapacity_mm}mm`, fill: '#34C759', fontSize: 9 }} />
                                                {/* Wilting Point (Danger) */}
                                                <ReferenceLine y={data.config.wiltingPoint_mm} stroke="#FF3B30" strokeDasharray="4 4" label={{ position: 'insideBottomRight', value: `Danger: ${data.config.wiltingPoint_mm}mm`, fill: '#FF3B30', fontSize: 9 }} />
                                                <Area
                                                    type="monotone"
                                                    dataKey="balance_mm"
                                                    stroke="#007AFF"
                                                    strokeWidth={3}
                                                    fillOpacity={1}
                                                    fill="url(#colorBalance)"
                                                    animationDuration={1500}
                                                />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                    <div className="px-4 pb-2 flex justify-between text-[10px] text-gray-400 font-medium uppercase tracking-wider">
                                        <span>{t('forecast.today')}</span>
                                        <span>{t('forecast.3_months')}</span>
                                        <span>{t('forecast.6_months')}</span>
                                    </div>
                                </div>

                                {/* Key Stats */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-white p-4 rounded-2xl shadow-sm">
                                        <div className="flex items-center gap-2 text-blue-500 mb-1">
                                            <CloudRain size={18} />
                                            <span className="text-[10px] font-bold uppercase">{t('forecast.inflow')}</span>
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{data.summary.totalRain}<span className="text-sm font-normal text-gray-400">mm</span></p>
                                        <p className="text-xs text-gray-400 mt-1">{t('forecast.expected_rain')}</p>
                                    </div>
                                    <div className={`p-4 rounded-2xl shadow-sm ${data.summary.daysStress > 0 ? 'bg-red-50' : 'bg-white'}`}>
                                        <div className={`flex items-center gap-2 mb-1 ${data.summary.daysStress > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                            <AlertOctagon size={18} />
                                            <span className="text-[10px] font-bold uppercase">{t('forecast.stress')}</span>
                                        </div>
                                        <p className={`text-2xl font-bold ${data.summary.daysStress > 0 ? 'text-red-600' : 'text-gray-900'}`}>{data.summary.daysStress}<span className="text-sm font-normal text-gray-400"> {t('forecast.days')}</span></p>
                                        <p className="text-xs text-gray-400 mt-1">{t('forecast.below_wilting')}</p>
                                    </div>
                                </div>

                                {/* Config Info */}
                                <div className="grid grid-cols-2 gap-2 text-[10px]">
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <span className="text-gray-400">{t('forecast.soil_capacity')}</span>
                                        <p className="font-bold text-gray-700">{data.config.soilCapacity_mm}mm</p>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl">
                                        <span className="text-gray-400">{t('forecast.crop_water_use')}</span>
                                        <p className="font-bold text-gray-700">{data.config.kc_peak}x baseline</p>
                                    </div>
                                </div>

                                <div className={`p-4 rounded-2xl border ${data.summary.firstStressDay ? 'bg-red-50/50 border-red-100' : 'bg-green-50/50 border-green-100'}`}>
                                    <p className={`text-xs leading-relaxed ${data.summary.firstStressDay ? 'text-red-800' : 'text-green-800'}`}>
                                        <strong>{t('forecast.analysis')}:</strong> {t('forecast.planting')}
                                        <span className="font-bold underline mx-1">{selectedCrop} {t('forecast.water_use_crops')}</span>
                                        {data.summary.firstStressDay
                                            ? ` ${t('forecast.is_risky')} ${t('forecast.stress_begins')} ${data.summary.firstStressDay}. ${t('forecast.consider_irrigation')}`
                                            : ` ${t('forecast.is_safe')} ${t('forecast.safe_msg')}`}
                                    </p>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                                <AlertOctagon size={48} className="mb-4 text-gray-300" />
                                <p className="font-medium">{t('forecast.no_data')}</p>
                                <p className="text-xs mt-2 max-w-[200px] text-center">{t('forecast.check_connection')}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default WaterForecastModal;
