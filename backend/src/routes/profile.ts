import { Router } from 'express';
import { supabase } from '../server';

const router = Router();

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

// Get Profile
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

    if (error) return res.status(404).json({ error: 'Profile not found' });
    res.json(data);
});

export default router;
