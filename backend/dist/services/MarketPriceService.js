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
exports.MarketPriceService = void 0;
const axios_1 = __importDefault(require("axios"));
const CropDatabase_1 = require("../data/CropDatabase");
class MarketCache {
    constructor() {
        this.cache = null;
        this.TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
    }
    set(data) {
        this.cache = {
            data,
            timestamp: Date.now()
        };
    }
    get() {
        if (!this.cache)
            return null;
        if (Date.now() - this.cache.timestamp > this.TTL_MS) {
            this.cache = null;
            return null;
        }
        return this.cache.data;
    }
    clear() {
        this.cache = null;
    }
}
const marketCache = new MarketCache();
// ============================================================================
// MOCK DATA (Fallback - Replace with real API)
// ============================================================================
const MOCK_COMMODITIES = [
    'Cotton', 'Wheat', 'Paddy', 'Soybean', 'Maize', 'Jowar', 'Bajra',
    'Sugarcane', 'Onion', 'Potato', 'Tomato', 'Chilli', 'Turmeric',
    'Groundnut', 'Sunflower', 'Mustard', 'Gram', 'Tur', 'Moong',
    'Urad', 'Masoor', 'Pomegranate', 'Grapes', 'Banana', 'Mango',
    'Rice', 'Orange', 'Apple', 'Garlic', 'Ginger', 'Cabbage',
    'Cauliflower', 'Brinjal', 'Okra', 'Coconut', 'Papaya', 'Guava',
    'Spinach', 'Fenugreek', 'Coriander', 'Lemon', 'Mosambi'
];
function generateMockPrice(commodity, state = 'Uttar Pradesh') {
    const basePrice = Math.floor(Math.random() * 5000) + 1500;
    const change = (Math.random() - 0.5) * 20; // -10% to +10%
    const arrival = Math.floor(Math.random() * 50000) + 1000;
    return {
        commodity,
        market: `${state.split(' ')[0]} Mandi`,
        state: state,
        modalPrice: basePrice,
        minPrice: basePrice * 0.9,
        maxPrice: basePrice * 1.1,
        arrivalQuantity: arrival,
        date: new Date(),
        trend: change > 3 ? 'GROWING' : change < -3 ? 'DEPRECIATING' : 'STABLE',
        changePercent: parseFloat(change.toFixed(2)),
        demand: arrival > 30000 ? 'HIGH' : arrival > 15000 ? 'MEDIUM' : 'LOW'
    };
}
// ============================================================================
// MARKET PRICE SERVICE
// ============================================================================
class MarketPriceService {
    /**
     * Get complete market snapshot with categorized crops
     */
    static getMarketSnapshot() {
        return __awaiter(this, arguments, void 0, function* (state = 'Uttar Pradesh') {
            // Check cache
            const cached = marketCache.get();
            if (cached) {
                console.log('[MarketPrice] Returning cached snapshot');
                return cached;
            }
            console.log('[MarketPrice] Fetching fresh market data...');
            let apiCrops = [];
            try {
                // STRATEGY 1: Fetch from Agmarknet API
                const apiSnapshot = yield this.fetchFromAgmarknet(state);
                if (apiSnapshot) {
                    apiCrops = apiSnapshot.allCrops;
                }
            }
            catch (error) {
                console.warn('[MarketPrice] Agmarknet API failed, falling back to CROP_DATABASE');
            }
            // FALLBACK: If API returned no data, use CROP_DATABASE
            if (apiCrops.length === 0) {
                console.log('[MarketPrice] Using CROP_DATABASE for market data');
                apiCrops = CropDatabase_1.CROP_DATABASE.map(c => ({
                    commodity: c.name,
                    market: 'General Market',
                    state: state,
                    modalPrice: c.baseMarketPrice / 10, // Tons to Quintal (approx)
                    minPrice: (c.baseMarketPrice / 10) * 0.9,
                    maxPrice: (c.baseMarketPrice / 10) * 1.1,
                    arrivalQuantity: 1000,
                    date: new Date(),
                    trend: 'STABLE',
                    changePercent: 0,
                    demand: 'MEDIUM'
                }));
            }
            // STRATEGY 2: No Mock Data - Using real API with calculated changePercent
            // Mock data disabled because changePercent is now calculated from price spread
            // const mockCrops = MOCK_COMMODITIES.map(c => generateMockPrice(c, state));
            // STRATEGY 3: Use only real API data
            const mergedCropsMap = new Map();
            // Only real API data (no mock data needed)
            apiCrops.forEach(crop => mergedCropsMap.set(crop.commodity.toLowerCase(), crop));
            const allCrops = Array.from(mergedCropsMap.values());
            const snapshot = {
                trending: allCrops.filter(c => c.trend === 'GROWING')
                    .sort((a, b) => b.changePercent - a.changePercent) // Highest gain first
                    .slice(0, 10),
                allTimeBest: allCrops.sort((a, b) => b.modalPrice - a.modalPrice).slice(0, 10),
                depreciating: allCrops.filter(c => c.trend === 'DEPRECIATING')
                    .sort((a, b) => a.changePercent - b.changePercent) // Most negative first (lowest value)
                    .slice(0, 10),
                highDemand: allCrops.filter(c => c.demand === 'HIGH')
                    .sort((a, b) => b.arrivalQuantity - a.arrivalQuantity) // Highest quantity first
                    .slice(0, 10),
                allCrops: allCrops.sort((a, b) => a.commodity.localeCompare(b.commodity)),
                lastUpdated: new Date()
            };
            marketCache.set(snapshot);
            return snapshot;
        });
    }
    /**
     * Search crops by name
     */
    static searchCrops(query_1) {
        return __awaiter(this, arguments, void 0, function* (query, state = 'Uttar Pradesh') {
            const snapshot = yield this.getMarketSnapshot(state);
            const lowerQuery = query.toLowerCase();
            return snapshot.allCrops.filter(crop => crop.commodity.toLowerCase().includes(lowerQuery));
        });
    }
    /**
     * Get single crop price
     */
    static getCropPrice(commodity_1) {
        return __awaiter(this, arguments, void 0, function* (commodity, state = 'Uttar Pradesh') {
            const snapshot = yield this.getMarketSnapshot(state);
            return snapshot.allCrops.find(c => c.commodity.toLowerCase() === commodity.toLowerCase()) || null;
        });
    }
    /**
     * Get live ticker data (top 5 crops)
     */
    static getLiveTicker() {
        return __awaiter(this, arguments, void 0, function* (state = 'Uttar Pradesh') {
            const snapshot = yield this.getMarketSnapshot(state);
            // Mix of growing and high-value crops
            const growing = snapshot.trending.slice(0, 2);
            const highValue = snapshot.allTimeBest.slice(0, 3);
            return [...growing, ...highValue].slice(0, 5);
        });
    }
    // ==========================================================================
    // PRIVATE: Agmarknet API Integration
    // ==========================================================================
    static fetchFromAgmarknet(state) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            try {
                // Agmarknet API endpoint (requires API key)
                const url = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';
                const response = yield axios_1.default.get(url, {
                    params: {
                        'api-key': this.API_KEY,
                        'format': 'json',
                        'filters[state]': state,
                        'limit': 100
                    },
                    timeout: 10000
                });
                console.log('[API DEBUG] Response status:', response.status);
                console.log('[API DEBUG] Records count:', ((_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.records) === null || _b === void 0 ? void 0 : _b.length) || 0);
                if (!response.data || !response.data.records || response.data.records.length === 0) {
                    console.log('[API DEBUG] No records in response. Full response:', JSON.stringify(response.data).slice(0, 500));
                    throw new Error('No data received');
                }
                const records = response.data.records;
                console.log('[API DEBUG] Sample commodities:', records.slice(0, 5).map((r) => r.commodity).join(', '));
                // Transform API data
                const allCrops = records.map((record) => {
                    const modal = parseFloat(record.modal_price) || 0;
                    const min = parseFloat(record.min_price) || 0;
                    const max = parseFloat(record.max_price) || 0;
                    // Calculate changePercent from price spread (max vs modal for upside potential)
                    // This represents market volatility/opportunity
                    const upside = modal > 0 ? ((max - modal) / modal) * 100 : 0;
                    const downside = modal > 0 ? ((min - modal) / modal) * 100 : 0;
                    const trend = this.calculateTrend(record);
                    // Use upside for growing, downside for depreciating
                    const changePercent = trend === 'GROWING' ? upside :
                        trend === 'DEPRECIATING' ? downside : 0;
                    return {
                        commodity: record.commodity,
                        market: record.market,
                        state: record.state,
                        modalPrice: modal,
                        minPrice: min,
                        maxPrice: max,
                        arrivalQuantity: parseFloat(record.arrival_quantity || record.arrivals || 0),
                        date: new Date(record.arrival_date),
                        trend,
                        changePercent: parseFloat(changePercent.toFixed(1)),
                        // Use price volatility as proxy for demand (API doesn't provide arrival_quantity)
                        // High volatility = high trading activity = high demand
                        demand: modal > 0 && ((max - min) / modal) > 0.15 ? 'HIGH' :
                            modal > 0 && ((max - min) / modal) > 0.05 ? 'MEDIUM' : 'LOW'
                    };
                });
                // Categorize
                return {
                    trending: allCrops.filter(c => c.trend === 'GROWING').slice(0, 10),
                    allTimeBest: allCrops.sort((a, b) => b.modalPrice - a.modalPrice).slice(0, 10),
                    depreciating: allCrops.filter(c => c.trend === 'DEPRECIATING').slice(0, 10),
                    highDemand: allCrops.filter(c => c.demand === 'HIGH').slice(0, 10),
                    allCrops: allCrops,
                    lastUpdated: new Date()
                };
            }
            catch (error) {
                console.error('[MarketPrice] Agmarknet error:', error);
                return null;
            }
        });
    }
    static calculateTrend(record) {
        const modal = parseFloat(record.modal_price) || 0;
        const max = parseFloat(record.max_price) || 0;
        const min = parseFloat(record.min_price) || 0;
        if (!modal)
            return 'STABLE';
        // Upside potential: how much higher than modal the max price is
        const upside = (max - modal) / modal;
        // Downside risk: how much lower than modal the min price is
        const downside = (modal - min) / modal;
        // If upside potential is significant and greater than downside, it's growing
        if (upside > 0.05)
            return 'GROWING';
        // If downside risk is significant, it's depreciating
        if (downside > 0.05)
            return 'DEPRECIATING';
        return 'STABLE';
    }
    static getAllCropPrices(district, cropIds) {
        return __awaiter(this, void 0, void 0, function* () {
            // Fetch data for the specified state (API works best with State)
            const snapshot = yield this.getMarketSnapshot(district); // Parameter is named district but we should pass state
            const prices = {};
            // Convert snapshot array to map
            for (const cropId of cropIds) {
                // Fuzzy match logic: Check if API commodity name is part of our ID or vice versa
                const match = snapshot.allCrops.find(c => {
                    const apiName = c.commodity.toLowerCase();
                    const idName = cropId.replace(/_/g, ' ').toLowerCase();
                    // e.g. "onion" in "onion red" or "cotton" in "bt cotton"
                    return idName.includes(apiName) || apiName.includes(idName.split(' ')[0]);
                });
                if (match) {
                    // API returns ₹/Quintal. Convert to ₹/Ton (x10)
                    const pricePerTon = match.modalPrice * 10;
                    prices[cropId] = {
                        currentPrice: pricePerTon,
                        msp: this.getMSP(cropId),
                        trend: match.trend,
                        lastUpdated: match.date
                    };
                }
                else {
                    // FUNDAMENTAL FIX: Use CROP_DATABASE as single source of truth
                    // baseMarketPrice is already in INR/Ton - no conversion needed!
                    const dbCrop = CropDatabase_1.CROP_DATABASE.find(c => c.id === cropId);
                    const fallbackPrice = (dbCrop === null || dbCrop === void 0 ? void 0 : dbCrop.baseMarketPrice) || 20000; // 20k/Ton default
                    prices[cropId] = {
                        currentPrice: fallbackPrice,
                        msp: this.getMSP(cropId),
                        trend: 'STABLE',
                        lastUpdated: new Date()
                    };
                }
            }
            return prices;
        });
    }
    static getMSP(cropId) {
        // MSP Values in INR/Quintal (2024-25 Kharif/Rabi)
        const mspMap = {
            'rice': 2183, 'wheat': 2275, 'maize': 2090,
            'onion': 1500, 'tomato': 1200, 'potato': 900,
            'cotton': 6620, 'soybean': 4600, 'sugarcane': 315, // Sugarcane is per quintal
            'gram': 5440, 'tur': 7000, 'moong': 8558
        };
        // Try exact match first
        const id = cropId.toLowerCase().replace(/_/g, ' ');
        for (const key of Object.keys(mspMap)) {
            if (id.includes(key))
                return mspMap[key];
        }
        return 1500; // Default fallback
    }
}
exports.MarketPriceService = MarketPriceService;
MarketPriceService.API_KEY = '579b464db66ec23bdd0000011b2fcab683764ffe7055911229777786';
exports.default = MarketPriceService;
