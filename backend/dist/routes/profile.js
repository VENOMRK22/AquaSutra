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
// Update User Profile (Village, Avatar, etc.)
router.put('/location', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, village, district, state } = req.body;
        if (!userId || !village) {
            return res.status(400).json({ error: 'User ID and Village are required' });
        }
        const { data, error } = yield server_1.supabase
            .from('profiles')
            .update({ village, district, state })
            .eq('id', userId)
            .select();
        if (error)
            throw error;
        res.json({ success: true, profile: data[0] });
    }
    catch (error) {
        console.error('Profile Update Error:', error);
        res.status(500).json({ error: error.message });
    }
}));
// Get Profile
router.get('/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { data, error } = yield server_1.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
    if (error)
        return res.status(404).json({ error: 'Profile not found' });
    res.json(data);
}));
exports.default = router;
