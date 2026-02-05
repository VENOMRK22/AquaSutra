import express from 'express';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { calculateWaterBalance } from '../services/waterScore';
import { PincodeService } from '../services/PincodeService';

const router = express.Router();


// GET /api/water/score?lat=xxx&lon=xxx&userId=xxx
router.get('/score', async (req, res) => {
    try {
        console.log("🌊 [Backend] Water Score Request Received");

        const { lat, lon, userId, pincode } = req.query;
        const authHeader = req.headers.authorization;

        console.log(`📍 Coords: ${lat}, ${lon} | Pin: ${pincode || 'N/A'} | User: ${userId}`);
        console.log(`🔑 Auth Header Present: ${!!authHeader}`);

        if (((!lat || !lon) && !pincode) || !userId) {
            // We need coords OR pincode, AND userId
            console.error("❌ Missing Parameters");
            return res.status(400).json({ error: 'Missing lat/lon OR pincode, or userId' });
        }

        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_ANON_KEY;

        if (!supabaseUrl || !supabaseKey) { /* ... check ... */ }

        // Context Setup
        const latVal = lat ? parseFloat(lat as string) : 0;
        const lonVal = lon ? parseFloat(lon as string) : 0;

        // 1. Determine Block Info (Fast Lookup)
        let blockInfo = null;

        if (pincode) {
            blockInfo = PincodeService.getBlockByPincode(pincode as string);
        }

        if (!blockInfo && latVal && lonVal) {
            // Fallback: reverse geocode from coordinates using new PincodeService
            blockInfo = PincodeService.getNearestPincodeBlock(latVal, lonVal);
        }

        console.log(`📍 Block Identified: ${blockInfo?.block}, ${blockInfo?.district} (${blockInfo?.classification})`);

        // Create Scoped Supabase Client
        const scopedSupabase = createClient(supabaseUrl, supabaseKey, {
            global: {
                headers: {
                    Authorization: authHeader || ''
                }
            }
        });

        // 2. Resolve Village Name (Optional - Display only)
        // If we found a block via Pincode, we might not need to call Nominatim unless user wants specific village name

        let villageName = 'Unknown Village';
        if (latVal && lonVal) {
            try {
                // Keep existing slow lookup for specific village name if needed, 
                // or assume Pincode name is enough. keeping it for now but logging error non-fatally
                /*
                const geoRes = await axios.get(...)
                */
            } catch (error) { }
        }

        // ... (User Profile Fetch - Same as before) ...
        let soilType = 'Medium Black';
        try {
            // ... profile fetch logic ...
            const { data: profile } = await scopedSupabase.from('profiles').select('soil_type').eq('id', userId as string).single();
            if (profile?.soil_type) soilType = profile.soil_type;
        } catch (e) { }

        // 3. Calculate "Water Bank Balance" (Aquifer Inventory)
        // Pass the pre-resolved blockInfo to avoid re-calculating inside service
        const waterData = await calculateWaterBalance(
            latVal,
            lonVal,
            soilType,
            blockInfo // <--- NEW PARAM
        );

        res.json({
            ...waterData,
            villageName: waterData.villageName, // Service constructs better name now
            blockInfo: blockInfo ? {
                block: blockInfo.block,
                district: blockInfo.district,
                pincode: blockInfo.pincode,
                classification: blockInfo.classification,
                waterTableDepth: blockInfo.waterTableDepth
            } : null
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
