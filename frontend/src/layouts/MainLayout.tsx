import React from 'react';
import { Outlet } from 'react-router-dom';
import BottomNav from '../components/BottomNav';

const MainLayout: React.FC = () => {
    return (
        <div className="flex flex-col min-h-screen bg-ios-bg">
            <main className="flex-grow pt-safe-top pb-24 px-4 overflow-y-auto no-scrollbar">
                <Outlet />
            </main>

            <BottomNav />
        </div>
    );
};

export default MainLayout;
