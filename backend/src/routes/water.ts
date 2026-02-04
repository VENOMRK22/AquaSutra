import express from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { calculateWaterBalance } from '../services/waterScore';

const router = express.Router();


// GET /api/water/score?lat=xxx&lon=xxx&userId=xxx
router.get('/score', async (req, res) => {
    try {
        console.log("🌊 [Backend] Water Score Request Received");

        const { lat, lon, userId } = req.query;
        const authHeader = req.headers.authorization;

        console.log(`📍 Coords: ${lat}, ${lon} | User: ${userId}`);
        console.log(`🔑 Auth Header Present: ${!!authHeader}`);

        if (!lat || !lon || !userId) {
            console.error("❌ Missing Parameters");
            return res.status(400).json({ error: 'Missing lat, lon, or userId' });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) {
            console.error("❌ Server Environment Variables Missing (SUPABASE_URL/KEY)");
            return res.status(500).json({ error: 'Backend Configuration Error' });
        }

        // Create Scoped Supabase Client
        const scopedSupabase = createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: {
                    Authorization: authHeader || ''
                }
            }
        });

        // 1. Reverse Geocode (Get Village Name)
        // Using OpenStreetMap Nominatim (Free, requires User-Agent)
        let villageName = 'Unknown Village';
        try {
            const geoRes = await axios.get(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`, {
                headers: { 'User-Agent': 'AquaSutra-App/1.0' }
            });
            // Try to find village, town, or hamlet
            const address = geoRes.data.address;
            villageName = address.village || address.town || address.hamlet || address.city || 'Unknown Location';
        } catch (error) {
            console.error('Geocoding error:', error);
        }

        // 2. Fetch User Profile (Optional - allow default if missing)
        let soilType = 'Medium Black';

        try {
            const { data: profile, error: profileError } = await scopedSupabase
                .from('profiles')
                .select('soil_type')
                .eq('id', userId)
                .single();

            if (profile && profile.soil_type) {
                soilType = profile.soil_type;
            } else if (profileError) {
                console.warn('Profile fetch warning (using default soil):', profileError.message);
            }
        } catch (err) {
            console.warn('Profile fetch failed (using default soil)');
        }

        // 3. Calculate "Water Bank Balance" (Aquifer Inventory)
        const waterData = await calculateWaterBalance(
            parseFloat(lat as string),
            parseFloat(lon as string),
            soilType
        );

        res.json({
            ...waterData,
            villageName,
            // Keeping backwards compatibility for now if needed, or just sending new data
            // logic: waterData.balance_mm is the key metric now.
        });

    } catch (error) {
        console.error('Water Score Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


// GET /api/water/forecast?lat=...&lon=...&crop=...
import { runWaterSimulation } from '../services/waterForecast';

router.get('/forecast', async (req, res) => {
    try {
        const { lat, lon, crop, interventions } = req.query;
        if (!lat || !lon) return res.status(400).json({ error: "Missing coordinates" });

        const interventionList = interventions ? (interventions as string).split(',') : [];

        // Optional: Get soil from user profile again or pass as param. 
        // For speed, defaulting or using a simple param if frontend sends it.
        // We'll trust the simulation to default safely if soil is unknown.
        const simulationResult = await runWaterSimulation(
            parseFloat(lat as string),
            parseFloat(lon as string),
            'Medium Black', // Default or fetch from profile if needed
            (crop as string) || 'Sugarcane',
            interventionList
        );

        res.json(simulationResult);
    } catch (error) {
        console.error("Forecast Error:", error);
        res.status(500).json({ error: "Simulation Failed" });
    }
});

export default router;
