import { Router } from 'express';
import { supabase } from '../server';
import { LocationService } from '../services/LocationService';

const router = Router();

// Geocode GPS coordinates to location details
router.post('/geocode', async (req, res) => {
    try {
        const { lat, lon } = req.body;

        if (!lat || !lon) {
            return res.status(400).json({ error: 'Latitude and longitude are required' });
        }

        const locationInfo = await LocationService.getBlockFromCoords(lat, lon);

        res.json({
            success: true,
            location: {
                village: locationInfo.block,
                district: locationInfo.district,
                state: locationInfo.state,
                confidence: locationInfo.confidence,
                source: locationInfo.source
            }
        });
    } catch (error: any) {
        console.error('Geocoding Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Update User Profile (Village, Avatar, etc.)
router.put('/location', async (req, res) => {
    try {
        const { userId, village, district, state } = req.body;

        if (!userId || !village) {
            return res.status(400).json({ error: 'User ID and Village are required' });
        }

        const { data, error } = await supabase
            .from('profiles')
            .update({ village, district, state })
            .eq('id', userId)
            .select();

        if (error) throw error;

        res.json({ success: true, profile: data[0] });
    } catch (error: any) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Get Profile by query param (for ChatbotFab)
router.get('/', async (req, res) => {
    const userId = req.query.userId as string;

    if (!userId) {
        return res.status(400).json({ error: 'userId query parameter is required' });
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('id, village, district, state, full_name')
            .eq('id', userId)
            .maybeSingle();

        if (error) {
            console.error('[Profile] Supabase error:', error);
            return res.status(500).json({ error: error.message });
        }

        if (!data) {
            return res.status(404).json({ error: 'Profile not found', profile: null });
        }

        console.log('[Profile] Fetched for chatbot:', data);
        res.json({ success: true, profile: data });
    } catch (err: any) {
        console.error('[Profile] Error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Get Profile by path param (legacy)
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { data, error } = await supabase
        .from('profiles')
        .select('id, village, district, state, full_name')
        .eq('id', userId)
        .single();

    if (error) return res.status(404).json({ error: 'Profile not found' });
    res.json(data);
});

export default router;
