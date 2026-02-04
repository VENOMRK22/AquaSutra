import express from 'express';
import { supabase } from '../lib/supabase'; // Using the supabase client from lib

const router = express.Router();

// GET /api/farm
// Fetch farm details and crops for the current user
router.get('/', async (req, res) => {
    try {
        const userId = req.query.userId as string;
        if (!userId) return res.status(400).json({ error: "Missing userId" });

        // 1. Get Farm
        let { data: farm, error } = await supabase
            .from('farms')
            .select('*')
            .eq('user_id', userId)
            .single();

        if (error && error.code === 'PGRST116') {
            // Farm doesn't exist yet, create one
            const { data: newFarm, error: createError } = await supabase
                .from('farms')
                .insert({ user_id: userId, name: 'My Farm', total_area: 0 })
                .select()
                .single();

            if (createError) throw createError;
            farm = newFarm;
        } else if (error) {
            throw error;
        }

        // 2. Get Crops
        const { data: crops, error: cropError } = await supabase
            .from('farm_crops')
            .select('*')
            .eq('farm_id', farm.id);

        if (cropError) throw cropError;

        res.json({ farm, crops });

    } catch (err: any) {
        console.error("Fetch Farm Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/farm
// Update Farm Details (Total Area)
router.post('/', async (req, res) => {
    try {
        const { userId, total_area, name } = req.body;
        console.log("Saving Farm:", { userId, total_area });

        const { data, error } = await supabase
            .from('farms')
            .upsert({ user_id: userId, total_area, name }, { onConflict: 'user_id' })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        console.error("POST_FARM_ERROR:", err);
        res.status(500).json({ error: err.message });
    }
});

// POST /api/farm/crop
// Add a new crop
router.post('/crop', async (req, res) => {
    try {
        const { farmId, name, crop_type, soil_type, area, sowing_date } = req.body;
        // Note: 'crop_type' is now treated as 'Water Category' (High/Med/Low) in our logic
        // 'name' is the actual user-typed crop name (e.g. "Wheat")

        const { data, error } = await supabase
            .from('farm_crops')
            .insert({
                farm_id: farmId,
                name: name || 'Crop',
                crop_type: crop_type || 'Medium', // Saving Water Category here
                soil_type: soil_type || 'Clay',
                area,
                sowing_date
            })
            .select()
            .single();

        if (error) throw error;
        res.json(data);
    } catch (err: any) {
        console.error("Save Crop Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE /api/farm/crop/:id
// Remove a crop
router.delete('/crop/:id', async (req, res) => {
    try {
        const { error } = await supabase
            .from('farm_crops')
            .delete()
            .eq('id', req.params.id);

        if (error) throw error;
        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
