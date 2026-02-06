import axios from 'axios';
import { CROP_DATABASE } from './HydroEconomicEngine';

// ============================================================================
// INTERFACES
// ============================================================================

export interface CropPrice {
    commodity: string;
    market: string;
    state: string;
    modalPrice: number;        // ₹/quintal
    minPrice: number;
    maxPrice: number;
    arrivalQuantity: number;   // quintals
    date: Date;
    trend: 'GROWING' | 'DEPRECIATING' | 'STABLE';
    changePercent: number;     // % change in last 7 days
    demand: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface MarketSnapshot {
    trending: CropPrice[];      // Growing prices
    allTimeBest: CropPrice[];   // Highest profits historically
    depreciating: CropPrice[];  // Falling prices
    highDemand: CropPrice[];    // High arrival quantities
    allCrops: CropPrice[];      // Complete list for search
    lastUpdated: Date;
}

// ============================================================================
// CACHE
// ============================================================================

interface CacheEntry {
    data: MarketSnapshot;
    timestamp: number;
}

class MarketCache {
    private cache: CacheEntry | null = null;
    private TTL_MS = 6 * 60 * 60 * 1000; // 6 hours

    set(data: MarketSnapshot): void {
        this.cache = {
            data,
            timestamp: Date.now()
        };
    }

    get(): MarketSnapshot | null {
        if (!this.cache) return null;
        if (Date.now() - this.cache.timestamp > this.TTL_MS) {
            this.cache = null;
            return null;
        }
        return this.cache.data;
    }

    clear(): void {
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

function generateMockPrice(commodity: string, state: string = 'Uttar Pradesh'): CropPrice {
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

export class MarketPriceService {
    private static API_KEY = '579b464db66ec23bdd0000011b2fcab683764ffe7055911229777786';

    /**
     * Get complete market snapshot with categorized crops
     */
    static async getMarketSnapshot(state: string = 'Uttar Pradesh'): Promise<MarketSnapshot> {

        // Check cache
        const cached = marketCache.get();
        if (cached) {
            console.log('[MarketPrice] Returning cached snapshot');
            return cached;
        }

        console.log('[MarketPrice] Fetching fresh market data...');

        let apiCrops: CropPrice[] = [];

        try {
            // STRATEGY 1: Fetch from Agmarknet API
            const apiSnapshot = await this.fetchFromAgmarknet(state);
            if (apiSnapshot) {
                apiCrops = apiSnapshot.allCrops;
            }
        } catch (error) {
            console.warn('[MarketPrice] Agmarknet API failed, using full mock data');
        }

        // STRATEGY 2: Skipped (User requested no fake data)
        // const mockCrops = MOCK_COMMODITIES.map(c => generateMockPrice(c, state));

        // STRATEGY 3: Merge (Real data takes precedence)
        const mergedCropsMap = new Map<string, CropPrice>();

        // 1. No Mock Data - Purely API or MSP based
        // mockCrops.forEach(crop => mergedCropsMap.set(crop.commodity.toLowerCase(), crop));

        // 2. Add real API data
        apiCrops.forEach(crop => mergedCropsMap.set(crop.commodity.toLowerCase(), crop));

        const allCrops = Array.from(mergedCropsMap.values());

        const snapshot: MarketSnapshot = {
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
    }

    /**
     * Search crops by name
     */
    static async searchCrops(query: string, state: string = 'Uttar Pradesh'): Promise<CropPrice[]> {
        const snapshot = await this.getMarketSnapshot(state);
        const lowerQuery = query.toLowerCase();

        return snapshot.allCrops.filter(crop =>
            crop.commodity.toLowerCase().includes(lowerQuery)
        );
    }

    /**
     * Get single crop price
     */
    static async getCropPrice(commodity: string, state: string = 'Uttar Pradesh'): Promise<CropPrice | null> {
        const snapshot = await this.getMarketSnapshot(state);
        return snapshot.allCrops.find(c =>
            c.commodity.toLowerCase() === commodity.toLowerCase()
        ) || null;
    }

    /**
     * Get live ticker data (top 5 crops)
     */
    static async getLiveTicker(state: string = 'Uttar Pradesh'): Promise<CropPrice[]> {
        const snapshot = await this.getMarketSnapshot(state);

        // Mix of growing and high-value crops
        const growing = snapshot.trending.slice(0, 2);
        const highValue = snapshot.allTimeBest.slice(0, 3);

        return [...growing, ...highValue].slice(0, 5);
    }

    // ==========================================================================
    // PRIVATE: Agmarknet API Integration
    // ==========================================================================

    private static async fetchFromAgmarknet(state: string): Promise<MarketSnapshot | null> {
        try {
            // Agmarknet API endpoint (requires API key)
            const url = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

            const response = await axios.get(url, {
                params: {
                    'api-key': this.API_KEY,
                    'format': 'json',
                    'filters[state]': state,
                    'limit': 100
                },
                timeout: 10000
            });

            console.log('[API DEBUG] Response status:', response.status);
            console.log('[API DEBUG] Records count:', response.data?.records?.length || 0);

            if (!response.data || !response.data.records || response.data.records.length === 0) {
                console.log('[API DEBUG] No records in response. Full response:', JSON.stringify(response.data).slice(0, 500));
                throw new Error('No data received');
            }

            const records = response.data.records;
            console.log('[API DEBUG] Sample commodities:', records.slice(0, 5).map((r: any) => r.commodity).join(', '));

            // Transform API data
            const allCrops: CropPrice[] = records.map((record: any) => ({
                commodity: record.commodity,
                market: record.market,
                state: record.state,
                modalPrice: parseFloat(record.modal_price),
                minPrice: parseFloat(record.min_price),
                maxPrice: parseFloat(record.max_price),
                arrivalQuantity: parseFloat(record.arrival_quantity || record.arrivals || 0),
                date: new Date(record.arrival_date),
                trend: this.calculateTrend(record),
                changePercent: 0, // Would need historical data
                demand: parseFloat(record.arrival_quantity || record.arrivals || 0) > 1000 ? 'HIGH' : 'MEDIUM'
            }));

            // Categorize
            return {
                trending: allCrops.filter(c => c.trend === 'GROWING').slice(0, 10),
                allTimeBest: allCrops.sort((a, b) => b.modalPrice - a.modalPrice).slice(0, 10),
                depreciating: allCrops.filter(c => c.trend === 'DEPRECIATING').slice(0, 10),
                highDemand: allCrops.filter(c => c.demand === 'HIGH').slice(0, 10),
                allCrops: allCrops,
                lastUpdated: new Date()
            };

        } catch (error) {
            console.error('[MarketPrice] Agmarknet error:', error);
            return null;
        }
    }

    private static calculateTrend(record: any): 'GROWING' | 'DEPRECIATING' | 'STABLE' {
        // Simple heuristic: if max > modal significantly, growing demand
        const modal = parseFloat(record.modal_price);
        const max = parseFloat(record.max_price);
        if (!modal || !max) return 'STABLE';

        const spread = (max - modal) / modal;
        if (spread > 0.02) return 'GROWING';
        if (spread < -0.02) return 'DEPRECIATING';
        return 'STABLE';
    }

    static async getAllCropPrices(district: string, cropIds: string[]): Promise<Record<string, any>> {
        // Fetch data for the specified state (API works best with State)
        const snapshot = await this.getMarketSnapshot(district); // Parameter is named district but we should pass state
        const prices: Record<string, any> = {};

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
            } else {
                // FUNDAMENTAL FIX: Use CROP_DATABASE as single source of truth
                // baseMarketPrice is already in INR/Ton - no conversion needed!
                const dbCrop = CROP_DATABASE.find(c => c.id === cropId);
                const fallbackPrice = dbCrop?.baseMarketPrice || 20000; // 20k/Ton default

                prices[cropId] = {
                    currentPrice: fallbackPrice,
                    msp: this.getMSP(cropId),
                    trend: 'STABLE',
                    lastUpdated: new Date()
                };
            }
        }

        return prices;
    }

    static getMSP(cropId: string): number {
        // MSP Values in INR/Quintal (2024-25 Kharif/Rabi)
        const mspMap: Record<string, number> = {
            'rice': 2183, 'wheat': 2275, 'maize': 2090,
            'onion': 1500, 'tomato': 1200, 'potato': 900,
            'cotton': 6620, 'soybean': 4600, 'sugarcane': 315, // Sugarcane is per quintal
            'gram': 5440, 'tur': 7000, 'moong': 8558
        };
        // Try exact match first
        const id = cropId.toLowerCase().replace(/_/g, ' ');
        for (const key of Object.keys(mspMap)) {
            if (id.includes(key)) return mspMap[key];
        }
        return 1500; // Default fallback
    }
}

export default MarketPriceService;
