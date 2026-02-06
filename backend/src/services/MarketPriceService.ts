import axios from 'axios';

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

        // STRATEGY 2: Generate Mock Data for gaps
        const mockCrops = MOCK_COMMODITIES.map(c => generateMockPrice(c, state));

        // STRATEGY 3: Merge (Real data takes precedence)
        const mergedCropsMap = new Map<string, CropPrice>();

        // 1. Add all mock crops first
        mockCrops.forEach(crop => mergedCropsMap.set(crop.commodity.toLowerCase(), crop));

        // 2. Overwrite with real API data where available
        apiCrops.forEach(crop => mergedCropsMap.set(crop.commodity.toLowerCase(), crop));

        const allCrops = Array.from(mergedCropsMap.values());

        const snapshot: MarketSnapshot = {
            trending: allCrops.filter(c => c.trend === 'GROWING').slice(0, 10),
            allTimeBest: allCrops.sort((a, b) => b.modalPrice - a.modalPrice).slice(0, 10),
            depreciating: allCrops.filter(c => c.trend === 'DEPRECIATING').slice(0, 10),
            highDemand: allCrops.filter(c => c.demand === 'HIGH').slice(0, 10),
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

            if (!response.data || !response.data.records || response.data.records.length === 0) {
                throw new Error('No data received');
            }

            const records = response.data.records;

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
}

export default MarketPriceService;
