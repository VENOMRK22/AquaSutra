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
exports.CGWBService = void 0;
// ------------------------------------
// Service Implementation
// ------------------------------------
class CGWBService {
    /**
     * Get Groundwater Status for a specific Block
     * Returns classification (Safe/Critical) and extraction metrics.
     */
    static getBlockWaterStatus(district, block) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${district.toLowerCase()}_${block.toLowerCase()}`;
            // 1. Check Cache
            if (this.cache[cacheKey] && (Date.now() - this.cache[cacheKey].timestamp < this.CACHE_TTL)) {
                console.log(`[CGWB] Returning cached status for ${block}, ${district}`);
                return this.cache[cacheKey].data;
            }
            try {
                // 2. Try Real API (Placeholder implementation)
                // const response = await axios.get(`${this.BASE_URL}/status`, { params: { district, block } });
                // const result = this.transformApiResponse(response.data);
                // For now, forcefully throw to use Mock Data (since we don't have real API keys)
                throw new Error("CGWB API credentials missing");
            }
            catch (error) {
                console.warn(`[CGWB] API failed for ${block}, using fallback data.`);
                // 3. Fallback Mock Data
                const mockData = this.getMockBlockData(district, block);
                // Save to Cache
                this.cache[cacheKey] = { data: mockData, timestamp: Date.now() };
                return mockData;
            }
        });
    }
    /**
     * Get Water Table Depth (bgl) for precise Lat/Lon
     * Used for Farm-level specificity vs Block-level average.
     */
    static getGroundwaterLevel(lat, lon) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                // Real API call would go here (Interpolation from nearest monitoring wells)
                // const res = await axios.get(`${this.BASE_URL}/level/nearest?lat=${lat}&lon=${lon}`);
                // return res.data.depth;
                throw new Error("API Connection failed");
            }
            catch (e) {
                // Mock Logic: Coordinate Bounding Box for Prayagraj
                // Lat: 25.2 to 25.6, Lon: 81.6 to 82.0
                if (lat > 25.2 && lat < 25.6 && lon > 81.6 && lon < 82.0) {
                    return 28.5; // Chaka/Sahson Deep Aquifer (Critical)
                }
                // Default 20.5m for rest of India
                return 20.5;
            }
        });
    }
    /**
     * Get 5-Year Historical Decline Trends
     * Crucial for "Predictive Water Balance"
     */
    static getHistoricalTrends(district_1, block_1) {
        return __awaiter(this, arguments, void 0, function* (district, block, years = 5) {
            const status = yield this.getBlockWaterStatus(district, block);
            const trends = [];
            let currentLevel = status.waterTableDepth;
            let year = new Date().getFullYear();
            // Simulate decline based on classification
            let declineRate = 0; // meters per year
            switch (status.classification) {
                case 'Over-exploited':
                    declineRate = 1.2;
                    break;
                case 'Critical':
                    declineRate = 0.8;
                    break;
                case 'Semi-critical':
                    declineRate = 0.4;
                    break;
                case 'Safe':
                    declineRate = -0.1;
                    break; // Actually recharging
            }
            for (let i = 0; i < years; i++) {
                trends.push({
                    year: year - i,
                    level: Number((currentLevel - (declineRate * i)).toFixed(2)),
                    change: declineRate
                });
            }
            return trends.reverse(); // Return chronological order (Oldest first)
        });
    }
    // ------------------------------------
    // Mock Data Generator (The "Expert System" Fallback)
    // ------------------------------------
    static getMockBlockData(district, block) {
        const d = district.toLowerCase();
        const b = block.toLowerCase();
        // SPECIFIC FALLBACKS FOR PRAYAGRAJ (REQ BY USER)
        if (d.includes('prayagraj') || d.includes('allahabad')) {
            if (b.includes('chaka')) {
                return {
                    district: 'Prayagraj',
                    block: 'Chaka',
                    state: 'Uttar Pradesh',
                    classification: 'Over-exploited', // Actually critical/OE in reality
                    waterTableDepth: 28.5,
                    rechargeRate: 85, // mm/year (Low)
                    extractionRate: 115, // >100% means depleting reserve
                    lastUpdated: new Date().toISOString()
                };
            }
            if (b.includes('sahson') || b.includes('bahadurpur')) {
                return {
                    district: 'Prayagraj',
                    block: 'Sahson',
                    state: 'Uttar Pradesh',
                    classification: 'Critical',
                    waterTableDepth: 22.0,
                    rechargeRate: 92,
                    extractionRate: 95, // Near limit
                    lastUpdated: new Date().toISOString()
                };
            }
        }
        // GENERIC FALLBACKS
        return {
            district: district,
            block: block,
            state: 'Unknown',
            classification: 'Semi-critical', // Safe default assumption for unknown deficit areas
            waterTableDepth: 20.0, // Default requested by user
            rechargeRate: 100,
            extractionRate: 85,
            lastUpdated: new Date().toISOString()
        };
    }
}
exports.CGWBService = CGWBService;
// API Endpoints (Placeholders for real India-WRIS / CGWB APIs)
// Real integration would require API Keys and specific WFS/WMS URLS.
CGWBService.BASE_URL = 'http://india-wris.nrsc.gov.in/api/v1/groundwater';
// In-memory cache: district_block -> { data, timestamp }
CGWBService.cache = {};
CGWBService.CACHE_TTL = 24 * 60 * 60 * 1000; // 24 Hours
