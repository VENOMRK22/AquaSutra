import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Loader2, ArrowRight, Mail, Lock, User } from 'lucide-react';

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false);

    // Form States
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');

    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isSignUp) {
                // Sign Up Logic
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            username: username, // Saved to profiles via Trigger
                        }
                    }
                });
                if (error) throw error;
                // For simplicity in this demo, auto-login or alert check email
                // Supabase default is "Confirm Email", but for dev we might want to disable that or alert user.
                alert("Account created! Please check your email to confirm.");
                setIsSignUp(false); // Switch back to login
            } else {
                // Sign In Logic
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Authentication failed');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-full bg-white flex flex-col items-center pt-20 px-6 animate-fade-in text-ios-text">

            {/* Logo / Brand */}
            <div className="mb-10 flex flex-col items-center">
                <div className="w-24 h-24 bg-gradient-to-tr from-ios-blue to-ios-teal rounded-[1.5rem] shadow-ios-lg mb-6 flex items-center justify-center">
                    <svg className="w-12 h-12 text-white" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                </div>
                <h1 className="text-3xl font-bold tracking-tight mb-2">AquaSutra</h1>
                <p className="text-ios-subtext text-center text-sm px-4">
                    Precision irrigation management.
                </p>
            </div>

            {/* Content Container */}
            <div className="w-full max-w-sm space-y-6">
                {error && (
                    <div className="p-3 rounded-xl bg-red-50 text-red-500 text-sm font-medium text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleAuth} className="space-y-4">

                    {isSignUp && (
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-ios-subtext uppercase ml-1">Username</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                                <input
                                    type="text"
                                    placeholder="FarmerJohn"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="w-full bg-gray-100 rounded-xl pl-12 pr-4 py-4 text-lg outline-none focus:ring-2 focus:ring-ios-blue/20 transition-all placeholder:text-gray-400"
                                    required={isSignUp}
                                />
                            </div>
                        </div>
                    )}

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-ios-subtext uppercase ml-1">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-gray-100 rounded-xl pl-12 pr-4 py-4 text-lg outline-none focus:ring-2 focus:ring-ios-blue/20 transition-all placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-xs font-semibold text-ios-subtext uppercase ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-gray-100 rounded-xl pl-12 pr-4 py-4 text-lg outline-none focus:ring-2 focus:ring-ios-blue/20 transition-all placeholder:text-gray-400"
                                required
                                minLength={6}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-ios-blue text-white font-semibold text-lg py-4 rounded-xl shadow-ios active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : (isSignUp ? 'Create Account' : 'Sign In')}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="flex flex-col items-center gap-4">
                    <button
                        type="button"
                        onClick={() => setIsSignUp(!isSignUp)}
                        className="text-ios-blue font-medium text-sm hover:underline"
                    >
                        {isSignUp ? 'Already have an account? Sign In' : 'New here? Create Account'}
                    </button>

                    <button className="text-gray-400 text-xs hover:text-gray-600">
                        Forgot Password?
                    </button>
                </div>
            </div>

            <p className="fixed bottom-8 text-xs text-gray-400">
                v2.2 Auth Update
            </p>

        </div>
    );
};

export default Login;
