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
const supabase_1 = require("../lib/supabase"); // Using the supabase client from lib
const router = express_1.default.Router();
// GET /api/farm
// Fetch farm details and crops for the current user
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.query.userId;
        if (!userId)
            return res.status(400).json({ error: "Missing userId" });
        // 1. Get Farm
        let { data: farm, error } = yield supabase_1.supabase
            .from('farms')
            .select('*')
            .eq('user_id', userId)
            .single();
        if (error && error.code === 'PGRST116') {
            // Farm doesn't exist yet, create one
            const { data: newFarm, error: createError } = yield supabase_1.supabase
                .from('farms')
                .insert({ user_id: userId, name: 'My Farm', total_area: 0 })
                .select()
                .single();
            if (createError)
                throw createError;
            farm = newFarm;
        }
        else if (error) {
            throw error;
        }
        // 2. Get Crops
        const { data: crops, error: cropError } = yield supabase_1.supabase
            .from('farm_crops')
            .select('*')
            .eq('farm_id', farm.id);
        if (cropError)
            throw cropError;
        res.json({ farm, crops });
    }
    catch (err) {
        console.error("Fetch Farm Error:", err);
        res.status(500).json({ error: err.message });
    }
}));
// POST /api/farm
// Update Farm Details (Total Area)
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, total_area, name } = req.body;
        console.log("Saving Farm:", { userId, total_area });
        const { data, error } = yield supabase_1.supabase
            .from('farms')
            .upsert({ user_id: userId, total_area, name }, { onConflict: 'user_id' })
            .select()
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (err) {
        console.error("POST_FARM_ERROR:", err);
        res.status(500).json({ error: err.message });
    }
}));
// POST /api/farm/crop
// Add a new crop
router.post('/crop', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { farmId, name, crop_type, soil_type, area, sowing_date } = req.body;
        // Note: 'crop_type' is now treated as 'Water Category' (High/Med/Low) in our logic
        // 'name' is the actual user-typed crop name (e.g. "Wheat")
        const { data, error } = yield supabase_1.supabase
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
        if (error)
            throw error;
        res.json(data);
    }
    catch (err) {
        console.error("Save Crop Error:", err);
        res.status(500).json({ error: err.message });
    }
}));
// DELETE /api/farm/crop/:id
// Remove a crop
router.delete('/crop/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { error } = yield supabase_1.supabase
            .from('farm_crops')
            .delete()
            .eq('id', req.params.id);
        if (error)
            throw error;
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: err.message });
    }
}));
exports.default = router;
