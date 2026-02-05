
import axios from 'axios';

export interface MarketPrice {
    commodity: string;
    market: string;
    modalPrice: number;        // ₹/quintal (most common price)
    minPrice: number;
    maxPrice: number;
    date: Date;
    trend: 'UP' | 'DOWN' | 'STABLE';
    confidence: number;        // 0-100 (data reliability)
    arrivals: number;          // Quantity arrived at mandi (quintals)
}

export interface PriceHistory {
    commodity: string;
    prices: Array<{
        date: Date;
        price: number;
    }>;
    averagePrice30Days: number;
    volatility: number;        // Standard deviation
}

export interface CropPriceMap {
    [cropId: string]: {
        currentPrice: number;     // ₹/ton (Converted from Quintal)
        msp: number | null;       // Minimum Support Price
        trend: 'UP' | 'DOWN' | 'STABLE';
        lastUpdated: Date;
    };
}

export class MarketPriceService {
    private static API_KEY = process.env.DATA_GOV_IN_API_KEY || ''; // Ensure this is set in .env
    private static BASE_URL = 'https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070';

    // In-memory cache: Key = "commodity_market_date", Value = MarketPrice
    private static cache = new Map<string, { data: MarketPrice, expires: number }>();
    private static CACHE_TTL = 6 * 60 * 60 * 1000; // 6 Hours

    /**
     * Get Live Price for a Commodity (e.g., "Wheat", "Paddy(Dhan)")
     */
    static async getLivePrice(commodity: string, market: string = 'Prayagraj'): Promise<MarketPrice | null> {
        const today = new Date().toISOString().split('T')[0];
        const cacheKey = `price_${commodity}_${market}_${today}`;

        // 1. Check Cache
        const cached = this.cache.get(cacheKey);
        if (cached && cached.expires > Date.now()) {
            return cached.data;
        }

        try {
            // 2. Fetch from Agmarknet API
            // Note: In a real scenario, we might need more complex filtering if the API format changes
            const response = await axios.get(this.BASE_URL, {
                params: {
                    'api-key': this.API_KEY,
                    format: 'json',
                    limit: 30, // Get enough records to calculate trend if needed
                    'filters[commodity_name]': commodity,
                    // 'filters[market_name]': market, // Optional: Filter by specific market or get average
                    'sort[arrival_date]': 'desc'
                },
                timeout: 5000
            });

            const records = response.data.records;
            if (!records || records.length === 0) return null;

            // 3. Process Data
            // Find record for the requested market, or fallback to the first record (nearest available)
            const record = records.find((r: any) => r.market_name?.toLowerCase() === market.toLowerCase()) || records[0];

            const trend = this.calculateTrend(records);

            const marketPrice: MarketPrice = {
                commodity: record.commodity_name,
                market: record.market_name,
                modalPrice: parseFloat(record.modal_price),
                minPrice: parseFloat(record.min_price),
                maxPrice: parseFloat(record.max_price),
                date: new Date(record.arrival_date),
                trend: trend,
                confidence: 85, // Simple static confidence for now
                arrivals: parseFloat(record.arrival_quantity || '0')
            };

            // 4. Update Cache
            this.cache.set(cacheKey, {
                data: marketPrice,
                expires: Date.now() + this.CACHE_TTL
            });

            return marketPrice;

        } catch (error) {
            console.warn(`[MarketPriceService] Failed to fetch price for ${commodity}:`, error);
            return null;
        }
    }

    /**
     * Get Price History & Volatility
     */
    static async getPriceHistory(commodity: string, days: number = 90): Promise<PriceHistory> {
        // In a real implementation, we would query a historical database or make a wider API call.
        // For prototype, we will return a simulated history based on current price if API fails 
        // or a limited history from the live fetch if available.

        // Mocking logic for stability in this phase:
        const current = await this.getLivePrice(commodity) || { modalPrice: 2200 }; // Default fallback
        const basePrice = current.modalPrice;

        const history: Array<{ date: Date; price: number }> = [];
        let runningSum = 0;
        const prices: number[] = [];

        for (let i = 0; i < 30; i++) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            // Simulate slight volatility
            const variance = (Math.random() - 0.5) * (basePrice * 0.1);
            const p = basePrice + variance;
            history.push({ date: d, price: p });
            prices.push(p);
            runningSum += p;
        }

        const avg = runningSum / 30;
        const varianceSum = prices.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0);
        const volatility = Math.sqrt(varianceSum / 30);

        return {
            commodity,
            prices: history,
            averagePrice30Days: parseFloat(avg.toFixed(2)),
            volatility: parseFloat(volatility.toFixed(2))
        };
    }

    /**
     * Bulk fetch prices for multiple crops
     */
    static async getAllCropPrices(district: string, cropIds: string[]): Promise<CropPriceMap> {
        const resultMap: CropPriceMap = {};

        const promises = cropIds.map(async (cropId) => {
            const commodityName = this.mapCropIdToCommodity(cropId);
            const liveData = await this.getLivePrice(commodityName, district); // Use district as market proxy

            const currentPriceQuintal = liveData ? liveData.modalPrice : this.getFallbackPrice(cropId);
            const currentPriceTon = currentPriceQuintal * 10; // Convert ₹/Quintal to ₹/Ton

            resultMap[cropId] = {
                currentPrice: currentPriceTon,
                msp: this.getMSP(cropId), // Already returns value in ₹/Ton if implemented, or we fix below
                trend: liveData ? liveData.trend : 'STABLE',
                lastUpdated: new Date()
            };
        });

        await Promise.all(promises);
        return resultMap;
    }

    /**
     * Get Government Minimum Support Price (₹/Quintal converted to ₹/Ton)
     */
    static getMSP(cropId: string, year: number = 2024): number | null {
        // Hardcoded Government MSP Data (2024-25) in ₹/Quintal
        const mspDatabase: Record<string, number> = {
            'wheat_lokwan': 2275,
            'paddy_basmati': 2300,
            'paddy_common': 2183,
            'sugarcane_1': 340, // FRP (Fair Remunerative Price)
            'cotton_bt': 6620, // Medium Staple
            'soybean_js': 4600,
            'gram_chana': 5440,
            'tur_arhar': 7000,
            'moong': 8558,
            'maize_rabbi': 2090,
            'jowar_hybrid': 3180,
            'bajra': 2500
        };

        const priceQuintal = mspDatabase[cropId];
        if (!priceQuintal) return null;

        return priceQuintal * 10; // Return in ₹/Ton
    }

    // --- Private Helpers ---

    private static calculateTrend(records: any[]): 'UP' | 'DOWN' | 'STABLE' {
        if (records.length < 14) return 'STABLE';

        // Simple moving average comparison
        const recent = records.slice(0, 7);
        const older = records.slice(7, 14);

        const avgRecent = recent.reduce((sum: number, r: any) => sum + parseFloat(r.modal_price), 0) / recent.length;
        const avgOlder = older.reduce((sum: number, r: any) => sum + parseFloat(r.modal_price), 0) / older.length;

        const changePercent = ((avgRecent - avgOlder) / avgOlder) * 100;

        if (changePercent > 5) return 'UP';
        if (changePercent < -5) return 'DOWN';
        return 'STABLE';
    }

    private static mapCropIdToCommodity(cropId: string): string {
        // Map internal Crop IDs to Agmarknet Commodity Names
        // This mapping needs to be accurate for API hits
        const map: Record<string, string> = {
            'wheat_lokwan': 'Wheat',
            'sugarcane_1': 'Sugarcane',
            'paddy_basmati': 'Paddy(Dhan)(Basmati)',
            'cotton_bt': 'Cotton',
            'gram_chana': 'Gram Raw(Chholia)',
            'soybean_js': 'Soyabean',
            'jowar_hybrid': 'Jowar(Sorgum)',
            'bajra': 'Bajra(Pearl Millet/Cumbu)',
            'maize_rabbi': 'Maize',
            'onion_red': 'Onion',
            'tomato_hybrid': 'Tomato',
            'potato_agra': 'Potato'
        };

        return map[cropId] || 'Wheat'; // Default fallback
    }

    private static getFallbackPrice(cropId: string): number {
        // Fallback prices in ₹/Quintal if API fails
        const fallback: Record<string, number> = {
            'wheat_lokwan': 2300,
            'sugarcane_1': 350,
            'paddy_basmati': 2500,
            'cotton_bt': 6800,
            'gram_chana': 5600,
            'soybean_js': 4700,
            'default': 2000
        };
        return fallback[cropId] || fallback['default'];
    }
}
