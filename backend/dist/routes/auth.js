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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const server_1 = require("../server");
const router = (0, express_1.Router)();
// Register/Login Route (Handled largely by Supabase Client on Frontend, but we sync profile here)
router.post('/sync-profile', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, email, full_name, mobile_number, village, farm_size_acres } = req.body;
    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }
    try {
        const { data, error } = yield server_1.supabase
            .from('profiles')
            .upsert({
            id,
            full_name,
            mobile_number,
            village,
            farm_size_acres,
            // created_at is auto-handled
        })
            .select()
            .single();
        if (error)
            throw error;
        res.json({ message: 'Profile synced successfully', profile: data });
    }
    catch (error) {
        console.error('Error syncing profile:', error);
        res.status(500).json({ error: error.message });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const { data, error } = yield server_1.supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();
        if (error)
            throw error;
        res.json(data);
    }
    catch (error) {
        res.status(404).json({ error: 'Profile not found' });
    }
}));
exports.default = router;
