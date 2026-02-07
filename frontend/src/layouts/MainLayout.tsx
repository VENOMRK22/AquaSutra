import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';
import { useAutoLocation } from '../hooks/useAutoLocation';
import ChatbotFab from '../components/ChatbotFab';

const MainLayout: React.FC = () => {
    // Auto-detect and save location on first login
    useAutoLocation();
    return (
        <div className="flex flex-col h-full bg-ios-bg">
            <main className="flex-grow pt-safe-top pb-24 px-4 overflow-y-auto no-scrollbar">
                <Outlet />
            </main>

            <ChatbotFab />
            <BottomNav />
        </div>
    );
};

export default MainLayout;
