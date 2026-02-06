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
const SowingDispatcher_1 = require("../services/SowingDispatcher");
const router = express_1.default.Router();
// GET /api/sowing/status
router.get('/status', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, lat, lon } = req.query;
        if (!userId || !lat || !lon) {
            res.status(400).json({ error: 'Missing userId, lat, or lon' });
            return;
        }
        const status = yield SowingDispatcher_1.SowingDispatcher.getStatus(userId, parseFloat(lat), parseFloat(lon));
        res.json(status);
    }
    catch (error) {
        console.error('Sowing Status API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}));
// POST /api/sowing/vote (Ground Truth)
router.post('/vote', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId, vote } = req.body; // vote: boolean
        yield SowingDispatcher_1.SowingDispatcher.submitVote(userId, vote);
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Vote failed' });
    }
}));
exports.default = router;
