import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { House, Tractor, Camera, User, TrendingUp } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const BottomNav: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { t } = useLanguage();

    return (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 glass-ios pb-safe-bottom w-full max-w-md border-t border-black/5">
            <div className="flex justify-around items-center h-14 px-2">

                <NavLink
                    to="/"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-[2px] ${isActive ? 'text-ios-blue' : 'text-ios-subtext hover:text-ios-gray'}`}
                >
                    <House size={26} strokeWidth={2} />
                    <span className="text-[10px] font-medium">{t('nav.home')}</span>
                </NavLink>

                <NavLink
                    to="/farm"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-[2px] ${isActive ? 'text-ios-blue' : 'text-ios-subtext hover:text-ios-gray'}`}
                >
                    <Tractor size={26} strokeWidth={2} />
                    <span className="text-[10px] font-medium">{t('nav.farm')}</span>
                </NavLink>

                <NavLink
                    to="/camera"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-[2px] ${isActive ? 'text-ios-blue' : 'text-ios-subtext hover:text-ios-gray'}`}
                >
                    <Camera size={26} strokeWidth={2} />
                    <span className="text-[10px] font-medium">{t('nav.camera')}</span>
                </NavLink>

                <button onClick={() => navigate('/leaderboard')} className={`flex flex-col items-center gap-1 transition-colors w-full h-full ${location.pathname === '/leaderboard' ? 'text-green-600' : 'text-gray-400'}`}>
                    <TrendingUp size={24} strokeWidth={location.pathname === '/leaderboard' ? 2.5 : 2} />
                    <span className="text-[10px] font-medium">{t('nav.market')}</span>
                </button>

                <NavLink
                    to="/profile"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-[2px] ${isActive ? 'text-ios-blue' : 'text-ios-subtext hover:text-ios-gray'}`}
                >
                    <User size={26} strokeWidth={2} />
                    <span className="text-[10px] font-medium">{t('nav.profile')}</span>
                </NavLink>

            </div>
        </nav>
    );
};

export default BottomNav;
