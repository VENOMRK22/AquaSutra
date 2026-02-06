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
exports.getMarketPrices = void 0;
const node_fetch_1 = __importDefault(require("node-fetch"));
// Sample API Key (Public Test Key)
const API_KEY = '579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b';
const BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
const getMarketPrices = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Try Fetching Real Data
        const response = yield (0, node_fetch_1.default)(`${BASE_URL}?api-key=${API_KEY}&format=json&limit=100`, {
            agent: new (require('https').Agent)({ rejectUnauthorized: false }) // Bypass SSL for Govt API if needed locally
        });
        const json = yield response.json();
        // Check if records exist
        if (json.records && json.records.length > 0) {
            const prices = {};
            json.records.forEach((record) => {
                const commodity = record.commodity;
                const price = parseFloat(record.modal_price);
                // Simple mapping (In real app, use fuzzy matching)
                if (commodity.includes('Cotton')) {
                    prices['Cotton'] = { crop: 'Cotton', price: price, trend: 'up' };
                }
                else if (commodity.includes('Wheat')) {
                    prices['Wheat'] = { crop: 'Wheat', price: price, trend: 'stable' };
                }
                else if (commodity.includes('Sugar')) { // Sugarcane usually not traded in mandi same way, but let's map
                    prices['Sugarcane'] = { crop: 'Sugarcane', price: price, trend: 'stable' };
                }
            });
            // Merge with defaults if missing (Hybrid Approach)
            return Object.assign(Object.assign({}, DEFAULT_PRICES), prices);
        }
    }
    catch (error) {
        console.error("Pricing API Fail, using defaults:", error);
    }
    return DEFAULT_PRICES;
});
exports.getMarketPrices = getMarketPrices;
// Fallback / Base Prices (₹/Quintal approx)
// Sugarcane is often /Ton, but let's standardize to Quintal for logic or handle conversion in logic
const DEFAULT_PRICES = {
    'Sugarcane': { crop: 'Sugarcane', price: 3000, trend: 'up' }, // ₹3000/Ton 
    // Let's assume Price is per UNIT specified in Benchmark.
    // Sugarcane Benchmark yield is Tons. Price should be per Ton.
    // Mandi API usually gives per Quintal.
    // We will normalize in Leaderboard Service.
    // For now, let's store RAW values.
    'Cotton': { crop: 'Cotton', price: 7200, trend: 'down' },
    'Wheat': { crop: 'Wheat', price: 2400, trend: 'stable' },
    'Rice': { crop: 'Rice', price: 2800, trend: 'up' },
    'Maize': { crop: 'Maize', price: 2100, trend: 'stable' },
    'Tomato': { crop: 'Tomato', price: 1500, trend: 'up' } // Volatile!
};
