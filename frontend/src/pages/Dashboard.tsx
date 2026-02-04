import React from 'react';
import { Sprout, ChevronRight, Calendar } from 'lucide-react';
import WaterBalanceWidget from '../components/WaterBalanceWidget';
// import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
    // const { user } = useAuth();
    const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="animate-fade-in space-y-6">
            {/* iOS Large Title Header */}
            <header className="pt-2 pb-1">
                <p className="text-ios-subtext text-xs font-semibold uppercase tracking-wide mb-1">{currentDate}</p>
                <div className="flex justify-between items-end">
                    <h1 className="text-4xl font-bold text-ios-text tracking-tight">Today</h1>
                    <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center text-ios-blue font-semibold text-sm">
                        RK
                    </div>
                </div>
            </header>

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
                        <h3 className="font-semibold text-ios-text text-base">Interview</h3>
                        <p className="text-ios-subtext text-xs mt-0.5">Start a new survey</p>
                    </div>
                </button>

                {/* Credit Score Widget */}
                <button className="bg-white rounded-2xl p-5 shadow-ios flex flex-col items-start gap-3 active:scale-95 transition-transform text-left">
                    <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center text-ios-orange">
                        <Sprout size={20} />
                    </div>
                    <div>
                        <h3 className="font-semibold text-ios-text text-base">Credit Score</h3>
                        <p className="text-ios-subtext text-xs mt-0.5">Check farm health</p>
                    </div>
                </button>
            </div>

            {/* List Section (Recent Activity) */}
            <div>
                <div className="flex items-center justify-between mb-2 px-1">
                    <h3 className="text-xl font-bold text-ios-text">Activity</h3>
                    <button className="text-ios-blue text-sm font-medium">See All</button>
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
    );
};

// Simple Icon component helper to avoid unused import errors if lucide icons change
const FileTextIcon = ({ size }: { size: number }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <line x1="10" y1="9" x2="8" y2="9" />
    </svg>
);

export default Dashboard;
