import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { User, LogOut, ChevronRight, Settings, Phone, Globe } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ProfileData {
    username: string;
    full_name: string;
    avatar_url: string;
}

const Profile: React.FC = () => {
    const { user, signOut } = useAuth();
    const { language, setLanguage, t } = useLanguage();
    const [profile, setProfile] = useState<ProfileData | null>(null);

    useEffect(() => {
        const getProfile = async () => {
            try {
                if (!user) return;

                const { data, error } = await supabase
                    .from('profiles')
                    .select('username, full_name, avatar_url')
                    .eq('id', user.id)
                    .single();

                if (error) {
                    console.warn("Profile fetch error/missing:", error.message);
                } else {
                    setProfile(data);
                }
            } catch (error) {
                console.error('Error loading profile:', error);
            }
        };

        getProfile();
    }, [user]);

    const handleSignOut = async () => {
        await signOut();
    };

    return (
        <div className="animate-fade-in pb-10">
            {/* Header */}
            <header className="pt-4 pb-6 px-4">
                <h1 className="text-3xl font-bold text-ios-text tracking-tight">{t('profile.title')}</h1>
            </header>

            <div className="space-y-6 px-4">

                {/* Profile Card */}
                <div className="bg-white rounded-[1.5rem] p-6 shadow-ios flex items-center gap-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 text-2xl font-bold border border-black/5">
                        {profile?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || <User />}
                    </div>
                    <div className="overflow-hidden">
                        <h2 className="text-xl font-bold text-ios-text truncate">
                            {profile?.username || 'Farmer'}
                        </h2>
                        <p className="text-ios-subtext text-sm truncate">{user?.email}</p>
                    </div>
                </div>

                {/* Settings Group 1 */}
                <div className="bg-white rounded-2xl overflow-hidden shadow-ios">
                    <div className="p-4 flex items-center justify-between border-b border-gray-100 active:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-ios-blue">
                                <Settings size={18} />
                            </div>
                            <span className="font-medium text-ios-text">App Settings</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                    </div>

                    {/* Language Switcher */}
                    <div className="p-4 flex items-center justify-between border-b border-gray-100">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-500">
                                <Globe size={18} />
                            </div>
                            <span className="font-medium text-ios-text">{t('profile.language')}</span>
                        </div>
                        <div className="flex bg-gray-100 rounded-lg p-1">
                            {(['en', 'mr', 'hi'] as const).map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setLanguage(lang)}
                                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${language === lang
                                            ? 'bg-white text-ios-text shadow-sm'
                                            : 'text-gray-400 hover:text-gray-600'
                                        }`}
                                >
                                    {lang === 'en' ? 'En' : lang === 'mr' ? 'म' : 'हि'}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-4 flex items-center justify-between active:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center text-ios-green">
                                <Phone size={18} />
                            </div>
                            <span className="font-medium text-ios-text">Help & Support</span>
                        </div>
                        <ChevronRight size={20} className="text-gray-300" />
                    </div>
                </div>

                {/* Sign Out Button */}
                <button
                    onClick={handleSignOut}
                    className="w-full bg-white text-red-500 font-semibold text-lg py-4 rounded-xl shadow-ios active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-red-100"
                >
                    <LogOut size={20} />
                    Sign Out
                </button>

                <p className="text-center text-xs text-gray-400 pt-4">
                    AquaSutra v1.0.0
                    <br />
                    User ID: {user?.id.slice(0, 8)}...
                </p>

            </div>
        </div>
    );
};

export default Profile;
