import React, { useState } from 'react';
import { X, Sprout, Droplets, Calendar, AlertCircle, CheckCircle2, Loader2, ChevronRight } from 'lucide-react';
import { API_BASE_URL } from '../lib/config';

interface CropAdvisorModalProps {
    isOpen: boolean;
    onClose: () => void;
    crop: any; // Using any for flexibility with Crop interface
}

interface Advice {
    growthStage: {
        stage: string;
        description: string;
        progressPercent: number;
    };
    healthCheck: {
        status: 'Good' | 'Attention Needed' | 'Critical';
        symptoms: string[];
        advice: string;
    };
    waterSchedule: {
        frequency: string;
        amount: string;
        nextWatering: string;
        tip: string;
    };
    schedule: {
        date: string;
        task: string;
        type: string;
        details: string;
    }[];
    nextSteps: {
        title: string;
        description: string;
    };
}

const CropAdvisorModal: React.FC<CropAdvisorModalProps> = ({ isOpen, onClose, crop }) => {
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState<Advice | null>(null);
    const [irrigationMethods] = useState(['Drip', 'Flood', 'Sprinkler', 'Rainfed']);
    const [selectedIrrigation, setSelectedIrrigation] = useState('Drip');
    const [currentStage, setCurrentStage] = useState('Vegetative'); // Default
    const [observations, setObservations] = useState('');
    const [saving, setSaving] = useState(false);

    if (!isOpen || !crop) return null;

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE_URL}/api/inference/crop-advice`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cropName: crop.name,
                    sowingDate: crop.sowing_date,
                    area: crop.area,
                    soilType: crop.soil_type || 'Medium',
                    irrigationMethod: selectedIrrigation,
                    currentStage,
                    observations
                })
            });
            const data = await res.json();
            if (data.success && data.advice) {
                setAdvice(data.advice);
            } else {
                alert("Could not generate advice properly.");
            }
        } catch (e) {
            console.error(e);
            alert("Connection failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleSavePlan = async () => {
        if (!advice) return;
        setSaving(true);
        try {
            const combinedActivities = [...advice.schedule];

            const res = await fetch(`${API_BASE_URL}/api/activities/save`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    cropId: crop.id,
                    activities: combinedActivities,
                    waterSchedule: advice.waterSchedule
                })
            });
            const data = await res.json();
            if (data.success) {
                alert("Plan saved to your Dashboard!");
                onClose();
            } else {
                alert("Failed to save plan.");
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-6 text-white relative shrink-0">
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 bg-white/10 rounded-full hover:bg-white/20">
                        <X size={20} />
                    </button>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="bg-white/20 p-2 rounded-xl">
                            <Sprout size={24} />
                        </div>
                        <h2 className="text-2xl font-bold">{crop.name} Advisory</h2>
                    </div>
                    <p className="text-emerald-100 opacity-90 text-sm ml-1">AI-Powered Growth & Health Analysis</p>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto grow custom-scrollbar">

                    {!advice ? (
                        <div className="space-y-6">
                            {/* Stage Input */}
                            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                                <label className="block text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Current Crop Stage</label>
                                <select
                                    value={currentStage}
                                    onChange={(e) => setCurrentStage(e.target.value)}
                                    className="w-full p-3 rounded-xl bg-white border border-orange-200 font-bold text-gray-800 focus:ring-2 focus:ring-orange-500 outline-none appearance-none"
                                >
                                    <option value="Seedling">🌱 Seedling (Early Days)</option>
                                    <option value="Vegetative">🌿 Vegetative (Growing Leaves)</option>
                                    <option value="Flowering">🌻 Flowering (Blooms)</option>
                                    <option value="Fruiting">🍅 Fruiting / Pod Formation</option>
                                    <option value="Maturation">🌾 Maturation / Harvest Ready</option>
                                </select>
                            </div>

                            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100">
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Irrigation Method</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {irrigationMethods.map(m => (
                                        <button
                                            key={m}
                                            onClick={() => setSelectedIrrigation(m)}
                                            className={`p-3 rounded-xl text-sm font-semibold transition-all ${selectedIrrigation === m
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200'
                                                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Current Observations (Optional)</label>
                                <textarea
                                    value={observations}
                                    onChange={(e) => setObservations(e.target.value)}
                                    placeholder="e.g. Leaves turning yellow, pests seen..."
                                    className="w-full p-4 bg-gray-50 rounded-2xl text-gray-800 font-medium h-32 focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                                />
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={loading}
                                className="w-full py-4 bg-emerald-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 size={24} className="animate-spin" /> Analyzing...
                                    </>
                                ) : (
                                    <>
                                        Generate Advice <ChevronRight size={20} />
                                    </>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">

                            {/* 1. Growth Stage */}
                            <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
                                <h3 className="text-emerald-800 font-bold mb-1 flex items-center gap-2">
                                    <Sprout size={18} /> {advice.growthStage.stage}
                                </h3>
                                <p className="text-sm text-emerald-700 leading-relaxed mb-3">{advice.growthStage.description}</p>
                                <div className="w-full bg-emerald-200/50 rounded-full h-2">
                                    <div
                                        className="bg-emerald-500 h-2 rounded-full transition-all duration-1000"
                                        style={{ width: `${advice.growthStage.progressPercent}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* 2. Watering Schedule */}
                            <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                                <h3 className="text-blue-800 font-bold mb-3 flex items-center gap-2">
                                    <Droplets size={18} /> Watering Schedule
                                </h3>
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-white p-3 rounded-xl border border-blue-100">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Frequency</p>
                                        <p className="font-bold text-blue-900">{advice.waterSchedule.frequency}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-xl border border-blue-100">
                                        <p className="text-[10px] text-gray-400 uppercase font-bold">Amount</p>
                                        <p className="font-bold text-blue-900">{advice.waterSchedule.amount}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-blue-700 bg-blue-100/50 p-2 rounded-lg">
                                    <strong>Tip:</strong> {advice.waterSchedule.tip}
                                </p>
                            </div>

                            {/* 3. Action Schedule */}
                            <div>
                                <h3 className="text-gray-900 font-bold mb-3 flex items-center gap-2">
                                    <Calendar size={18} /> Upcoming Tasks
                                </h3>
                                <div className="space-y-3">
                                    {advice.schedule.map((task, idx) => (
                                        <div key={idx} className="flex gap-3 items-start bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            <div className="bg-white px-2 py-1 rounded text-center min-w-[50px] shadow-sm border border-gray-100">
                                                <div className="text-[10px] text-gray-400 uppercase font-bold">{task.date.split('-')[1]}</div>
                                                <div className="text-lg font-bold text-gray-800">{task.date.split('-')[2]}</div>
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${task.type === 'Fertilizer' ? 'bg-purple-100 text-purple-700' : 'bg-orange-100 text-orange-700'}`}>
                                                        {task.type}
                                                    </span>
                                                    <h4 className="font-bold text-gray-800 text-sm">{task.task}</h4>
                                                </div>
                                                <p className="text-xs text-gray-500">{task.details}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* 4. Next Steps */}
                            <div className="bg-yellow-50 rounded-2xl p-5 border border-yellow-100">
                                <h3 className="text-yellow-800 font-bold mb-1 flex items-center gap-2">
                                    <AlertCircle size={18} /> {advice.nextSteps.title}
                                </h3>
                                <p className="text-sm text-yellow-800/80 leading-relaxed">
                                    {advice.nextSteps.description}
                                </p>
                            </div>

                            {/* BUTTONS */}
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <button
                                    onClick={() => setAdvice(null)}
                                    className="py-3 bg-gray-100 text-gray-600 font-bold rounded-xl active:scale-95 transition-all"
                                >
                                    Re-Analyze
                                </button>
                                <button
                                    onClick={handleSavePlan}
                                    disabled={saving}
                                    className="py-3 bg-gray-900 text-white font-bold rounded-xl active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    {saving ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle2 size={20} />}
                                    Save Plan
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CropAdvisorModal;
