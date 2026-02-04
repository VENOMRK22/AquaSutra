import React from 'react';
import { NavLink } from 'react-router-dom';
import { House, Tractor, Camera, User } from 'lucide-react';

const BottomNav: React.FC = () => {
    return (
        // Fixed at bottom, but constrained to the max-width of the parent layout (effectively)
        // We achieve this by using 'fixed' but centering it max-w-md like the main app container
        // Added left-1/2 and -translate-x-1/2 to ensure it stays centered on the viewport
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50 glass-ios pb-safe-bottom w-full max-w-md border-t border-black/5">
            <div className="flex justify-around items-center h-14 px-2">

                <NavLink
                    to="/"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-[2px] ${isActive ? 'text-ios-blue' : 'text-ios-subtext hover:text-ios-gray'}`}
                >
                    <House size={26} strokeWidth={2} />
                    <span className="text-[10px] font-medium">Home</span>
                </NavLink>

                <NavLink
                    to="/farm"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-[2px] ${isActive ? 'text-ios-blue' : 'text-ios-subtext hover:text-ios-gray'}`}
                >
                    <Tractor size={26} strokeWidth={2} />
                    <span className="text-[10px] font-medium">Farm</span>
                </NavLink>

                <NavLink
                    to="/camera"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-[2px] ${isActive ? 'text-ios-blue' : 'text-ios-subtext hover:text-ios-gray'}`}
                >
                    <Camera size={26} strokeWidth={2} />
                    <span className="text-[10px] font-medium">Camera</span>
                </NavLink>

                <NavLink
                    to="/profile"
                    className={({ isActive }) => `flex flex-col items-center justify-center w-full h-full space-y-[2px] ${isActive ? 'text-ios-blue' : 'text-ios-subtext hover:text-ios-gray'}`}
                >
                    <User size={26} strokeWidth={2} />
                    <span className="text-[10px] font-medium">Profile</span>
                </NavLink>

            </div>
        </nav>
    );
};

export default BottomNav;
