"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const supabase_js_1 = require("@supabase/supabase-js");
const waterScore_1 = require("../services/waterScore");
const PincodeService_1 = require("../services/PincodeService");
const router = express_1.default.Router();
// GET /api/water/score?lat=xxx&lon=xxx&userId=xxx
router.get('/score', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        if (!supabaseUrl || !supabaseKey) {
            console.error("❌ Missing Supabase Credentials");
            return res.status(500).json({ error: 'Server Misconfiguration' });
        }
        // Context Setup
        const latVal = lat ? parseFloat(lat) : 0;
        const lonVal = lon ? parseFloat(lon) : 0;
        // 1. Determine Block Info (Fast Lookup)
        let blockInfo = null;
        if (pincode) {
            blockInfo = PincodeService_1.PincodeService.getBlockByPincode(pincode);
        }
        if (!blockInfo && latVal && lonVal) {
            // Fallback: reverse geocode from coordinates using new PincodeService
            blockInfo = PincodeService_1.PincodeService.getNearestPincodeBlock(latVal, lonVal);
        }
        console.log(`📍 Block Identified: ${blockInfo === null || blockInfo === void 0 ? void 0 : blockInfo.block}, ${blockInfo === null || blockInfo === void 0 ? void 0 : blockInfo.district} (${blockInfo === null || blockInfo === void 0 ? void 0 : blockInfo.classification})`);
        // Create Scoped Supabase Client
        const scopedSupabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey, {
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
            }
            catch (error) { }
        }
        // ... (User Profile Fetch - Same as before) ...
        let soilType = 'Medium Black';
        try {
            // ... profile fetch logic ...
            const { data: profile } = yield scopedSupabase.from('profiles').select('soil_type').eq('id', userId).single();
            if (profile === null || profile === void 0 ? void 0 : profile.soil_type)
                soilType = profile.soil_type;
        }
        catch (e) { }
        // 3. Calculate "Water Bank Balance" (Aquifer Inventory)
        // Pass the pre-resolved blockInfo to avoid re-calculating inside service
        const waterData = yield (0, waterScore_1.calculateWaterBalance)(latVal, lonVal, soilType, blockInfo // <--- NEW PARAM
        );
        res.json(Object.assign(Object.assign({}, waterData), { villageName: waterData.villageName, blockInfo: blockInfo ? {
                block: blockInfo.block,
                district: blockInfo.district,
                pincode: blockInfo.pincode,
                classification: blockInfo.classification,
                waterTableDepth: blockInfo.waterTableDepth
            } : null }));
    }
    catch (error) {
        console.error('Water Score Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// GET /api/water/forecast?lat=...&lon=...&crop=...
const waterForecast_1 = require("../services/waterForecast");
router.get('/forecast', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { lat, lon, crop, interventions } = req.query;
        if (!lat || !lon)
            return res.status(400).json({ error: "Missing coordinates" });
        const interventionList = interventions ? interventions.split(',') : [];
        // Optional: Get soil from user profile again or pass as param. 
        // For speed, defaulting or using a simple param if frontend sends it.
        // We'll trust the simulation to default safely if soil is unknown.
        const simulationResult = yield (0, waterForecast_1.runWaterSimulation)(parseFloat(lat), parseFloat(lon), 'Medium Black', // Default or fetch from profile if needed
        crop || 'Sugarcane', interventionList);
        res.json(simulationResult);
    }
    catch (error) {
        console.error("Forecast Error:", error);
        res.status(500).json({ error: "Simulation Failed" });
    }
}));
exports.default = router;
