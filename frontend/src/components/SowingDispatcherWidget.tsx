import { useState, useEffect } from 'react';
import { CloudRain, ThermometerSun, Tractor, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type DispatchState = 'WAITING' | 'POLLING' | 'DISPATCH_URGENT' | 'DISPATCH_STANDARD' | 'POST_SOWING';

interface SowingStatus {
    state: DispatchState;
    weather: {
        rain: number;
        temp: number;
        isIdeal: boolean;
    };
    cohort: 'URGENT' | 'STANDARD';
    message: string;
}

const SowingDispatcherWidget: React.FC = () => {
    // const { t } = useLanguage();
    const [config, setConfig] = useState<{ soil: 'Light' | 'Heavy'; tractor: 'Owner' | 'Renter' } | null>(null);
    const [status, setStatus] = useState<SowingStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [polled, setPolled] = useState(false);

    const fetchStatus = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                setLoading(false);
                return;
            }

            // Get location (Mock or Real)
            navigator.geolocation.getCurrentPosition(async (pos) => {
                const { latitude, longitude } = pos.coords;
                const res = await fetch(`/api/sowing/status?userId=${user.id}&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                setStatus(data);
                setLoading(false);
            }, async () => {
                // Fallback Lat/Lon (Pune)
                const res = await fetch(`/api/sowing/status?userId=${user.id}&lat=18.52&lon=73.85`);
                const data = await res.json();
                setStatus(data);
                setLoading(false);
            });
        } catch (e) {
            console.error(e);
            setLoading(false);
        }
    };

    // Load Config from local storage on mount
    useEffect(() => {
        const saved = localStorage.getItem('sowing_config');
        if (saved) setConfig(JSON.parse(saved));
        fetchStatus();
    }, []);

    const saveConfig = (soil: 'Light' | 'Heavy', tractor: 'Owner' | 'Renter') => {
        const newConfig = { soil, tractor };
        setConfig(newConfig);
        localStorage.setItem('sowing_config', JSON.stringify(newConfig));
    };

    const handlePoll = async (vote: boolean) => {
        setPolled(true);
        // Optimistic UI Update: If YES, move to dispatch locally while server processes
        if (vote && status) {
            setStatus({
                ...status,
                state: status.cohort === 'URGENT' ? 'DISPATCH_URGENT' : 'DISPATCH_STANDARD'
            });
        }

        // Send Vote to Backend
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            await fetch('/api/sowing/vote', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id, vote })
            });
        }
    };

    // STATE 0: SETUP (First Time User)
    if (!config) {
        return (
            <div className="bg-white rounded-[1.5rem] p-5 shadow-ios-lg mb-6 relative overflow-hidden">
                <div className="flex items-center gap-2 mb-4 opacity-70">
                    <Tractor size={14} className="text-ios-blue" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Season Setup</span>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">Prepare for Sowing</h3>
                <p className="text-sm text-gray-500 mb-4">To get your personalized sowing window and tractor rank, we need a few details.</p>

                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Soil Type</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => saveConfig('Light', 'Renter')} className="p-2 border rounded-lg text-sm hover:bg-gray-50">Light (Sandy)</button>
                            <button onClick={() => saveConfig('Heavy', 'Renter')} className="p-2 border rounded-lg text-sm hover:bg-gray-50">Heavy (Clay/Black)</button>
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">Tractor Access</label>
                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={() => saveConfig('Heavy', 'Owner')} className="p-2 border rounded-lg text-sm hover:bg-gray-50">I Own One</button>
                            <button onClick={() => saveConfig('Heavy', 'Renter')} className="p-2 border rounded-lg text-sm hover:bg-gray-50">I Rent One</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading || !status) return <div className="h-40 bg-gray-100 rounded-[1.5rem] animate-pulse mb-6" />;

    // Determine Cohort based on Config (Frontend override for demo per user request)
    // Logic: Light Soil + Renter = Urgent (Rank 1). Heavy Soil = Standard. Owner = Flexible.
    const displayCohort = config.soil === 'Light' && config.tractor === 'Renter' ? 'URGENT' : 'STANDARD';

    return (
        <div className="bg-white rounded-[1.5rem] p-5 shadow-ios-lg mb-6 relative overflow-hidden transition-all duration-500">
            {/* COMPONENT TITLE */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2 opacity-70">
                    <Tractor size={14} className="text-ios-blue" />
                    <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Season Command Center</span>
                </div>
                <button onClick={() => setConfig(null)} className="text-[10px] text-blue-500 font-medium bg-blue-50 px-2 py-1 rounded-full">
                    {config.soil} / {config.tractor}
                </button>
            </div>

            {/* STATE A: WAITING (The Watchtower) */}
            {status.state === 'WAITING' && (
                <div className="flex items-start gap-4">
                    <div className="bg-gray-100 p-3 rounded-2xl text-gray-400">
                        <CloudRain size={24} />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Waiting for Wapsa</h3>
                        <p className="text-sm text-gray-500 leading-relaxed mt-1">
                            {status.message}
                        </p>
                        <div className="flex items-center gap-4 mt-3">
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                <ThermometerSun size={14} /> {status.weather.temp.toFixed(1)}°C
                                ({status.weather.isIdeal ? <span className="text-emerald-500">Good</span> :
                                    status.weather.temp < 20 ? <span className="text-blue-400">Low</span> : <span className="text-red-400">High</span>})
                            </div>
                            <div className="flex items-center gap-1.5 text-xs font-medium text-gray-400">
                                <span className={`w-2 h-2 rounded-full ${displayCohort === 'URGENT' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                                Priority: {displayCohort === 'URGENT' ? 'Rank 1' : 'Rank 2'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* STATE B: POLLING (Ground Truth) */}
            {status.state === 'POLLING' && !polled && (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </span>
                        <h3 className="text-lg font-bold text-ios-blue">Rain Event Detected</h3>
                    </div>

                    <p className="text-sm text-gray-600 mb-4 bg-blue-50 p-3 rounded-xl border border-blue-100">
                        Topsoil report: <strong>{status.weather.rain.toFixed(1)}mm Rain</strong> recorded nearby.
                        Is your soil ready for the "Ball Test"?
                    </p>

                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => handlePoll(false)}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold active:scale-95 transition-transform"
                        >
                            <ThumbsDown size={18} /> No (Too Dry)
                        </button>
                        <button
                            onClick={() => handlePoll(true)}
                            className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-500 text-white font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
                        >
                            <ThumbsUp size={18} /> Yes (Perfect)
                        </button>
                    </div>
                </div>
            )}

            {/* STATE C: DISPATCH (The Queue - Standard Cohort) */}
            {(status.state === 'DISPATCH_STANDARD' || (status.state === 'POLLING' && polled && displayCohort === 'STANDARD')) && (
                <div className="animate-in zoom-in-95 duration-500">
                    <div className="flex items-start justify-between">
                        <div>
                            <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2">
                                Cohort: {displayCohort === 'URGENT' ? 'Light Soil' : 'Heavy Soil'}
                            </span>
                            <h3 className="text-xl font-bold text-gray-800 leading-tight">Prepare to Sow</h3>
                        </div>
                        <div className="bg-yellow-100 p-2.5 rounded-full text-yellow-600">
                            <AlertCircle size={24} />
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        <div className="flex gap-3 items-start p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="text-xs font-bold text-gray-400 mt-1 min-w-[60px]">Status</div>
                            <div className="text-sm text-gray-700">
                                <strong>Wait 24 Hours.</strong> {status.message}
                            </div>
                        </div>

                        <div className="flex gap-3 items-center p-3 bg-blue-50/50 rounded-xl border border-blue-100/50">
                            <Tractor size={18} className="text-blue-500" />
                            <div className="text-sm text-blue-800">
                                Tractor availability is <strong>Stable</strong>.
                            </div>
                            <button className="ml-auto text-xs font-bold bg-white px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 shadow-sm">
                                Book Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* STATE D: DISPATCH (The Queue - Urgent Cohort) */}
            {(status.state === 'DISPATCH_URGENT' || (status.state === 'POLLING' && polled && displayCohort === 'URGENT')) && (
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 -m-5 p-6 text-white animate-in zoom-in-95 duration-500">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <span className="inline-flex items-center gap-1.5 bg-white/20 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-2 text-white/90">
                                Priority: {displayCohort === 'URGENT' ? 'Rank 1' : 'Rank 2'}
                            </span>
                            <h3 className="text-2xl font-bold leading-tight">Sowing Window OPEN</h3>
                        </div>
                        <div className="bg-white/20 p-2.5 rounded-full text-white">
                            <CheckCircle2 size={24} />
                        </div>
                    </div>

                    <p className="text-emerald-100 text-sm mb-6 leading-relaxed">
                        {status.message}
                    </p>

                    <button className="w-full bg-white text-emerald-700 font-bold py-3.5 rounded-xl shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2">
                        <Tractor size={18} /> Call Tractor Service
                    </button>
                </div>
            )}
        </div>
    );
};

export default SowingDispatcherWidget;
