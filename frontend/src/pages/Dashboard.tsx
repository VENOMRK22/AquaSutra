
import React from 'react';
import { Sprout, ChevronRight, Droplets, TrendingUp, Calendar, CheckCircle2 } from 'lucide-react';
import WaterBalanceWidget from '../components/WaterBalanceWidget';
import SowingDispatcherWidget from '../components/SowingDispatcherWidget';
import { API_BASE_URL } from '../lib/config';

import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';



const Dashboard: React.FC = () => {
    const { t } = useLanguage();
    const [score, setScore] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const [activities, setActivities] = React.useState<any[]>([]);
    const navigate = useNavigate();

    const fetchActivities = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/activities/upcoming`);
            const data = await res.json();
            if (data.success && data.activities) {
                setActivities(data.activities);
            }
        } catch (e) {
            console.error("Failed to fetch activities", e);
        }
    };

    const markAsDone = async (id: string) => {
        try {
            setActivities(prev => prev.filter(a => a.id !== id));
            await fetch(`${API_BASE_URL}/api/activities/${id}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'Done' })
            });
        } catch (e) {
            console.error(e);
            fetchActivities();
        }
    };

    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    // 1. Fetch Score
                    try {
                        const res = await fetch(`${API_BASE_URL}/api/leaderboard?userId=${user.id}`);
                        const data = await res.json();
                        if (data.rankings && data.rankings.length > 0) {
                            setScore(data.rankings[0].score?.toString());
                        }
                    } catch (err) {
                        console.warn("Leaderboard fetch failed", err);
                    }
                }
            } catch (e) {
                console.error("Auth check failed", e);
            }
            setLoading(false);
        };
        fetchData();
        fetchActivities(); // Fetch activities on load
    }, []);

    const hasScore = score !== null && score !== undefined && score !== '';

    return (
        <div className="bg-gray-50">

            {/* Premium Hero Header */}
            <div className="relative bg-gradient-to-br from-emerald-600 to-teal-800 text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-xl overflow-hidden -mx-4 z-10">

                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-5 rounded-full blur-3xl pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-black opacity-10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="relative z-10 flex justify-between items-start">
                    <div>
                        <p className="text-emerald-100/90 text-[10px] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5">
                            <Droplets size={12} className="text-emerald-300" /> {t('dashboard.header')}
                        </p>

                        {loading ? (
                            <h1 className="text-5xl font-bold opacity-20 animate-pulse">{t('dashboard.loading')}</h1>
                        ) : hasScore ? (
                            <div>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <h1 className="text-6xl font-black tracking-tight drop-shadow-lg">{score}</h1>
                                    <div className="flex flex-col -mb-1">
                                        <span className="text-2xl font-bold text-emerald-100 leading-none">₹</span>
                                        <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">{t('dashboard.per_kl')}</span>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/10 shadow-sm">
                                    <TrendingUp size={14} className="text-emerald-300" />
                                    <span className="text-xs font-semibold text-white tracking-wide">{t('dashboard.profit_per_drop')}</span>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => navigate('/farm')}
                                className="group flex items-center gap-3 bg-white/20 hover:bg-white/30 active:bg-white/10 backdrop-blur-md transition-all px-5 py-3 rounded-2xl border border-white/20 shadow-lg mt-1"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-400 text-emerald-900 flex items-center justify-center shadow-inner group-active:scale-95 transition-transform">
                                    <Sprout size={20} className="fill-current" />
                                </div>
                                <div className="text-left">
                                    <p className="text-sm font-bold text-white leading-tight">{t('dashboard.setup_farm')}</p>
                                    <p className="text-[10px] text-emerald-100 opacity-90 font-medium">{t('dashboard.start_tracking')}</p>
                                </div>
                                <ChevronRight size={16} className="text-white/70 ml-1" />
                            </button>
                        )}
                    </div>

                    {/* Profile Avatar */}
                    <div className="p-1 bg-white/10 rounded-full backdrop-blur-sm border border-white/10 shadow-md mt-1">
                        <div className="w-11 h-11 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-full flex items-center justify-center text-teal-800 font-bold text-sm shadow-inner">
                            RK
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 space-y-6 -mt-8 relative z-20">

                {/* Featured Card (Water Balance) */}
                <WaterBalanceWidget />

                {/* PROACTIVE SOWING DISPATCHER (Season Command Centre) */}
                <div className="animate-in slide-in-from-bottom-4 duration-700 delay-150">
                    <SowingDispatcherWidget />
                </div>

                {/* UPCOMING ACTIVITIES WIDGET */}
                {activities.length > 0 && (
                    <div className="animate-in slide-in-from-bottom-4 duration-700 delay-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                <Calendar size={18} className="text-emerald-600" />
                                Upcoming Tasks
                            </h2>
                            <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
                                {activities.length} Pending
                            </span>
                        </div>
                        <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden border border-gray-100">
                            {activities.slice(0, 5).map((activity: any) => (
                                <div key={activity.id} className="p-4 border-b border-gray-50 last:border-0 flex items-start gap-3 hover:bg-gray-50 transition-colors">
                                    <button
                                        onClick={() => markAsDone(activity.id)}
                                        className="mt-1 w-6 h-6 rounded-full border-2 border-gray-300 flex items-center justify-center text-white hover:bg-emerald-500 hover:border-emerald-500 transition-all shrink-0"
                                    >
                                        <CheckCircle2 size={14} className="opacity-0 hover:opacity-100" />
                                    </button>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-800 text-sm truncate">{activity.title}</h4>
                                        <p className="text-xs text-gray-500 font-medium mt-0.5 line-clamp-1">{activity.description}</p>
                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded
                                                ${activity.activity_type === 'Water' ? 'bg-blue-50 text-blue-600' :
                                                    activity.activity_type === 'Fertilizer' ? 'bg-purple-50 text-purple-600' :
                                                        'bg-orange-50 text-orange-600'}`}>
                                                {activity.activity_type}
                                            </span>
                                            <span className="text-[10px] font-bold text-gray-400">
                                                📅 {new Date(activity.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                            </span>
                                            {activity.farm_crops?.name && (
                                                <span className="text-[10px] font-bold text-gray-400">
                                                    🌱 {activity.farm_crops.name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}


            </div>
        </div>
    );
};

export default Dashboard;
