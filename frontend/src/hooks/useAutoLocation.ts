import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface LocationData {
    village: string;
    district: string;
    state: string;
    confidence: number;
}

export const useAutoLocation = () => {
    const [locationStatus, setLocationStatus] = useState<'idle' | 'requesting' | 'success' | 'error'>('idle');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const setupLocation = async () => {
            try {
                // Get current user
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                // Check if profile already has location
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('village, district, state')
                    .eq('id', user.id)
                    .maybeSingle();

                // If location already set, skip
                if (profile?.village && profile?.district) {
                    console.log('[AutoLocation] Profile already has location');
                    setLocationStatus('success');
                    return;
                }

                // Request location permission
                setLocationStatus('requesting');
                console.log('[AutoLocation] Requesting GPS permission...');

                navigator.geolocation.getCurrentPosition(
                    async (position) => {
                        try {
                            const { latitude, longitude } = position.coords;
                            console.log('[AutoLocation] GPS:', latitude, longitude);

                            // Call backend geocoding API
                            const response = await fetch('http://localhost:3000/api/profile/geocode', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ lat: latitude, lon: longitude })
                            });

                            if (!response.ok) throw new Error('Geocoding failed');

                            const data = await response.json();
                            const location: LocationData = data.location;

                            console.log('[AutoLocation] Resolved:', location);

                            // Update profile
                            const { error: updateError } = await supabase
                                .from('profiles')
                                .update({
                                    village: location.village,
                                    district: location.district,
                                    state: location.state
                                })
                                .eq('id', user.id);

                            if (updateError) throw updateError;

                            console.log('[AutoLocation] Profile updated successfully');

                            // Dispatch event to notify chatbot to refresh context
                            window.dispatchEvent(new Event('location-updated'));

                            setLocationStatus('success');
                        } catch (err: any) {
                            console.error('[AutoLocation] Error:', err);
                            setError(err.message);
                            setLocationStatus('error');
                        }
                    },
                    (err) => {
                        console.warn('[AutoLocation] Permission denied:', err.message);
                        setError('Location permission denied');
                        setLocationStatus('error');
                    },
                    {
                        enableHighAccuracy: false,
                        timeout: 10000,
                        maximumAge: 300000 // Cache for 5 minutes
                    }
                );
            } catch (err: any) {
                console.error('[AutoLocation] Setup error:', err);
                setError(err.message);
                setLocationStatus('error');
            }
        };

        setupLocation();
    }, []);

    return { locationStatus, error };
};
