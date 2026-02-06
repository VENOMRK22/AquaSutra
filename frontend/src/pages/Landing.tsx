import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, Mail, Lock, User, Globe, Droplets, Leaf, Sun, Cloud, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const Landing: React.FC = () => {
    const { t, language, setLanguage } = useLanguage();
    const navigate = useNavigate();

    // -- Auth State --
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showAboutModal, setShowAboutModal] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { username } }
                });
                if (error) throw error;
                alert("Account created! Please check your email to confirm.");
                setIsSignUp(false);
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    const openLogin = () => {
        setIsSignUp(false);
        setShowAuthModal(true);
    };

    const openSignUp = () => {
        setIsSignUp(true);
        setShowAuthModal(true);
    };

    const features = [
        {
            icon: Droplets,
            titleKey: 'feature.smart_irrigation',
            descKey: 'feature.smart_irrigation_desc',
        },
        {
            icon: Sun,
            titleKey: 'feature.weather_insights',
            descKey: 'feature.weather_insights_desc',
        },
        {
            icon: Leaf,
            titleKey: 'feature.crop_health',
            descKey: 'feature.crop_health_desc',
        },
        {
            icon: Cloud,
            titleKey: 'feature.works_offline',
            descKey: 'feature.works_offline_desc',
        },
    ];

    return (
        <div className="min-h-screen bg-[#FAFAFA] text-gray-900 font-sans">
            
            {/* Background Video */}
            <div className="fixed inset-0 z-0 overflow-hidden">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="absolute w-full h-full object-cover"
                >
                    <source src="/hero-video.mov" type="video/quicktime" />
                    <source src="/hero-video.mp4" type="video/mp4" />
                </video>
                {/* Dark Overlay for text readability */}
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* -- HEADER -- */}
            <header className="fixed top-0 w-full bg-black/20 backdrop-blur-md z-50 border-b border-white/10">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-md">
                            <Droplets className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-xl tracking-tight text-white">AquaSutra</span>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Language Selector */}
                        <div className="flex items-center gap-2 bg-white/10 rounded-full px-3 py-2 border border-white/20">
                            <Globe size={14} className="text-white/70" />
                            <select 
                                value={language} 
                                onChange={(e) => setLanguage(e.target.value as 'en' | 'mr' | 'hi')}
                                className="bg-transparent text-sm font-medium text-white outline-none cursor-pointer"
                            >
                                <option value="en" className="bg-gray-900">EN</option>
                                <option value="mr" className="bg-gray-900">मराठी</option>
                                <option value="hi" className="bg-gray-900">हिंदी</option>
                            </select>
                        </div>

                        {/* Login Button */}
                        <button
                            onClick={openLogin}
                            className="px-5 py-2 bg-emerald-600 text-white font-semibold text-sm rounded-full hover:bg-emerald-700 transition-all active:scale-95 shadow-md shadow-emerald-200"
                        >
                            {t('auth.sign_in')}
                        </button>
                    </div>
                </div>
            </header>

            {/* -- AUTH MODAL -- */}
            {showAuthModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAuthModal(false)}
                    />
                    
                    {/* Modal */}
                    <div className="relative bg-white w-full max-w-md p-8 rounded-[2rem] shadow-2xl border border-gray-100 animate-slide-up">
                        {/* Close Button */}
                        <button
                            onClick={() => setShowAuthModal(false)}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        {/* Decorative Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                                <Droplets className="w-8 h-8 text-white" />
                            </div>
                        </div>

                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900">
                                {isSignUp ? t('auth.join_community') : t('auth.welcome_back')}
                            </h2>
                            <p className="text-gray-500 text-sm mt-2">
                                {isSignUp ? t('auth.join_desc') : t('auth.login_desc')}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-100 text-red-600 text-sm font-medium flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-red-500" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleAuth} className="space-y-4">
                            {isSignUp && (
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('auth.username')}</label>
                                    <div className="relative">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                        <input
                                            type="text"
                                            placeholder="FarmerJohn"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-base outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400 font-medium"
                                            required={isSignUp}
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('auth.email')}</label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-base outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400 font-medium"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t('auth.password')}</label>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                    <input
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-12 pr-4 py-4 text-base outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-gray-400 font-medium"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-emerald-600 text-white font-bold text-lg py-4 rounded-xl shadow-lg shadow-emerald-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 mt-6 hover:bg-emerald-700"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? t('auth.create_account') : t('auth.sign_in'))}
                                {!loading && <ArrowRight size={20} />}
                            </button>
                        </form>

                        <div className="mt-6 text-center">
                            <button
                                type="button"
                                onClick={() => setIsSignUp(!isSignUp)}
                                className="text-gray-500 font-medium text-sm hover:text-emerald-600 transition-colors"
                            >
                                {isSignUp ? t('auth.already_have') : t('auth.new_here')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -- HERO SECTION -- */}
            <section className="relative z-10 pt-32 sm:pt-40 pb-20 px-4 sm:px-6 min-h-screen flex items-center">
                <div className="max-w-5xl mx-auto w-full">
                    <div className="max-w-2xl">
                        {/* Left Content */}
                        <div className="text-center lg:text-left">
                            
                            {/* Hero Title */}
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] mb-6 text-white">
                                {t('landing.hero_title').split(',')[0]},
                                <span className="text-emerald-400">
                                    {' '}{t('landing.hero_title').split(',')[1]?.trim()}
                                </span>
                            </h1>
                            
                            {/* Subtitle */}
                            <p className="text-lg text-white/80 leading-relaxed mb-8 max-w-md mx-auto lg:mx-0">
                                {t('landing.hero_subtitle')}
                            </p>

                            {/* CTA Button */}
                            <div className="flex justify-center lg:justify-start">
                                <button 
                                    onClick={openSignUp}
                                    className="group px-8 py-4 bg-emerald-600 text-white font-bold rounded-full hover:bg-emerald-700 transition-all duration-300 active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
                                >
                                    {t('landing.start_farming')} 
                                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* -- FEATURES SECTION -- */}
            <section className="relative z-10 py-20 px-4 sm:px-6 bg-white">
                <div className="max-w-5xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                            {t('landing.features_title')}
                        </h2>
                        <p className="text-gray-500 max-w-lg mx-auto">
                            {t('landing.features_subtitle')}
                        </p>
                    </div>
                    <div className="grid grid-cols-2 gap-8 max-w-2xl mx-auto">
                        {features.map((feature, i) => (
                            <div 
                                key={i}
                                className="flex flex-col items-center text-center"
                            >
                                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center mb-4 shadow-lg shadow-teal-200">
                                    <feature.icon className="w-9 h-9 text-white" />
                                </div>
                                <h3 className="text-lg font-bold text-gray-900 mb-1">{t(feature.titleKey)}</h3>
                                <p className="text-gray-500 text-sm leading-relaxed">{t(feature.descKey)}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* -- ABOUT US SECTION -- */}
            <section className="relative z-10 py-16 px-4 sm:px-6 bg-gradient-to-b from-white to-stone-50">
                <div className="max-w-5xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Farmer Image */}
                        <div className="relative">
                            <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl">
                                <img 
                                    src="/farmer.jpg" 
                                    alt="Indian Farmer"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.src = 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&q=80';
                                    }}
                                />
                            </div>
                        </div>

                        {/* About Content */}
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
                                {t('about.title') !== 'about.title' ? t('about.title') : 'Empowering Farmers'}
                            </h2>
                            <p className="text-gray-600 leading-relaxed mb-6">
                                {t('about.description') !== 'about.description' ? t('about.description') : 'We believe every farmer deserves access to smart technology. Our mission is to help Indian farmers save water, increase yields, and earn more through AI-powered insights.'}
                            </p>
                            <button
                                onClick={() => setShowAboutModal(true)}
                                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-full hover:shadow-lg hover:scale-105 transition-all"
                            >
                                {t('about.learn_more') !== 'about.learn_more' ? t('about.learn_more') : 'About Us'}
                                <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* -- ABOUT US MODAL -- */}
            {showAboutModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                        onClick={() => setShowAboutModal(false)}
                    />
                    <div className="relative bg-white w-full max-w-2xl p-8 rounded-3xl shadow-2xl max-h-[80vh] overflow-y-auto">
                        <button
                            onClick={() => setShowAboutModal(false)}
                            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                        >
                            <X size={20} className="text-gray-500" />
                        </button>

                        <div className="text-center mb-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Droplets className="w-8 h-8 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900">About AquaSutra</h2>
                        </div>

                        <div className="space-y-6 text-gray-600">
                            <p className="leading-relaxed">
                                AquaSutra is an innovative smart irrigation platform designed specifically for Indian farmers. We combine cutting-edge AI technology with deep understanding of local farming practices to help you make better decisions.
                            </p>
                            
                            <div className="bg-teal-50 p-6 rounded-2xl">
                                <h3 className="font-bold text-gray-900 mb-3">Our Mission</h3>
                                <p className="text-sm leading-relaxed">
                                    To empower every Indian farmer with smart water management tools that save resources, increase crop yields, and boost income. We believe technology should be accessible to all, regardless of farm size or technical expertise.
                                </p>
                            </div>

                            <div className="bg-emerald-50 p-6 rounded-2xl">
                                <h3 className="font-bold text-gray-900 mb-3">What We Offer</h3>
                                <ul className="text-sm space-y-2">
                                    <li>• AI-powered irrigation scheduling based on weather and soil conditions</li>
                                    <li>• 180-day weather forecasts tailored to your exact location</li>
                                    <li>• Crop health monitoring and yield optimization</li>
                                    <li>• Multi-language support (English, हिंदी, मराठी)</li>
                                    <li>• Works offline and in low connectivity areas</li>
                                </ul>
                            </div>

                            <div className="bg-amber-50 p-6 rounded-2xl">
                                <h3 className="font-bold text-gray-900 mb-3">Why Choose Us</h3>
                                <p className="text-sm leading-relaxed">
                                    Built by a team that understands Indian agriculture, AquaSutra is designed to work in real-world conditions - from the fields of Maharashtra to the farms of Punjab. Simple, effective, and built for you.
                                </p>
                            </div>
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => { setShowAboutModal(false); openSignUp(); }}
                                className="px-8 py-4 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-full hover:shadow-lg transition-all"
                            >
                                {t('landing.start_farming')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* -- FOOTER -- */}
            <footer className="relative z-10 py-12 bg-white text-center border-t border-gray-100">
                <div className="flex justify-center items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                        <Droplets className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg text-gray-900">AquaSutra</span>
                </div>
                <p className="text-sm text-gray-400">
                    © 2026 AquaSutra. Empowering Indian Farmers.
                </p>
            </footer>
        </div>
    );
};

export default Landing;
