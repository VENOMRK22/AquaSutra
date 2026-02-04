import React from 'react';
import { Sprout, ChevronRight, Calendar, Droplets, TrendingUp } from 'lucide-react';
import WaterBalanceWidget from '../components/WaterBalanceWidget';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';

// Simple Icon component helper
const FileTextIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

const Dashboard: React.FC = () => {
    const { t } = useLanguage();
    const [score, setScore] = React.useState<string | null>(null);
    const [loading, setLoading] = React.useState(true);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchScore = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const res = await fetch(`http://localhost:3000/api/leaderboard?userId=${user.id}`);
                    const data = await res.json();
                    console.log("[Dashboard] Fetched Score for", user.id, data);

                    if (data.rankings && data.rankings.length > 0) {
                        const s = data.rankings[0].score;
                        if (s !== null && s !== undefined) {
                            setScore(s.toString());
                        }
                    }
                }
            } catch (e) {
                console.error("Score fetch failed", e);
            }
            setLoading(false);
        };
        fetchScore();
    }, []);

    const hasScore = score !== null && score !== undefined && score !== '';

    return (
        <div className="bg-gray-50 min-h-screen pb-24">

            {/* Premium Hero Header */}
            <div className="relative bg-gradient-to-br from-emerald-600 to-teal-800 text-white pt-8 pb-16 px-6 rounded-b-[2.5rem] shadow-xl overflow-hidden -mx-0 z-10">

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

                {/* Grid Widgets */}
                <div className="grid grid-cols-2 gap-4">
                    {/* Interview Widget */}
                    <button className="bg-white rounded-2xl p-5 shadow-ios flex flex-col items-start gap-3 active:scale-95 transition-transform text-left">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-ios-purple">
                            <FileTextIcon size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-ios-text text-base">{t('dashboard.interview')}</h3>
                            <p className="text-ios-subtext text-xs mt-0.5">{t('dashboard.start_survey')}</p>
                        </div>
                    </button>

                    {/* Credit Score Widget */}
                    <button className="bg-white rounded-2xl p-5 shadow-ios flex flex-col items-start gap-3 active:scale-95 transition-transform text-left">
                        <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-ios-orange">
                            <Sprout size={20} />
                        </div>
                        <div>
                            <h3 className="font-semibold text-ios-text text-base">{t('dashboard.credit_score')}</h3>
                            <p className="text-ios-subtext text-xs mt-0.5">{t('dashboard.check_health')}</p>
                        </div>
                    </button>
                </div>

                {/* List Section (Recent Activity) */}
                <div>
                    <div className="flex items-center justify-between mb-2 px-1">
                        <h3 className="text-xl font-bold text-ios-text">{t('dashboard.activity')}</h3>
                        <button className="text-ios-blue text-sm font-medium">{t('dashboard.see_all')}</button>
                    </div>

                    <div className="bg-white rounded-2xl overflow-hidden shadow-ios divide-y divide-gray-100">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="p-4 flex items-center gap-4 active:bg-gray-50 transition-colors">
                                <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-ios-blue flex-shrink-0">
                                    <Calendar size={18} />
                                </div>
                                <div className="flex-grow">
                                    <h4 className="text-sm font-medium text-ios-text">Irrigation Cycle</h4>
                                    <p className="text-xs text-ios-subtext">Yesterday, 4:30 PM</p>
                                </div>
                                <div className="flex items-center text-ios-subtext">
                                    <span className="text-sm mr-2">45m</span>
                                    <ChevronRight size={16} className="text-gray-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
