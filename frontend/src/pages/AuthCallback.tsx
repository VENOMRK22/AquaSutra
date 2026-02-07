import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Handle the redirect code/token from Supabase
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                navigate('/dashboard');
            } else {
                navigate('/login');
            }
        });
    }, [navigate]);

    return (
        <div className="h-full w-full flex items-center justify-center bg-deep-forest text-white">
            <div className="animate-pulse flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p>Verifying login...</p>
            </div>
        </div>
    );
};

export default AuthCallback;
