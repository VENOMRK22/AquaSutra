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
const MarketPriceService_1 = require("../services/MarketPriceService");
const router = express_1.default.Router();
// GET /api/market/snapshot - Get categorized market data
router.get('/snapshot', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { state = 'Uttar Pradesh' } = req.query;
        // Debug
        console.log(`[API] Fetching market snapshot for state: ${state}`);
        const snapshot = yield MarketPriceService_1.MarketPriceService.getMarketSnapshot(state);
        res.json({
            success: true,
            data: snapshot
        });
    }
    catch (error) {
        console.error('Market Snapshot Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market data'
        });
    }
}));
// GET /api/market/search?q=wheat
router.get('/search', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { q, state = 'Uttar Pradesh' } = req.query;
        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q" is required'
            });
        }
        const results = yield MarketPriceService_1.MarketPriceService.searchCrops(q, state);
        res.json({
            success: true,
            query: q,
            count: results.length,
            data: results
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Search failed'
        });
    }
}));
// GET /api/market/ticker - Live ticker for top 5 crops
router.get('/ticker', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { state = 'Uttar Pradesh' } = req.query;
        const ticker = yield MarketPriceService_1.MarketPriceService.getLiveTicker(state);
        res.json({
            success: true,
            data: ticker
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ticker fetch failed'
        });
    }
}));
// GET /api/market/crop/:name - Get specific crop details
router.get('/crop/:name', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name } = req.params;
        const { state = 'Uttar Pradesh' } = req.query;
        const crop = yield MarketPriceService_1.MarketPriceService.getCropPrice(name, state);
        if (!crop) {
            return res.status(404).json({
                success: false,
                error: `Crop "${name}" not found`
            });
        }
        res.json({
            success: true,
            data: crop
        });
    }
    catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch crop details'
        });
    }
}));
exports.default = router;
