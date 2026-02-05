
import axios from 'axios';
import pincodeDataRaw from '../data/pincodeMapping.json';

// Type assertion for the JSON import
const pincodeData = pincodeDataRaw as Record<string, { district: string; block: string; state: string }>;

export interface BlockInfo {
    pincode: string;
    district: string;
    block: string;
    state: string;
    confidence: number; // 0-100
    source: 'API' | 'CACHE' | 'FALLBACK_NEAREST';
}

interface CacheEntry {
    data: BlockInfo;
    timestamp: number;
}

export class LocationService {
    // 7 Days Cache TTL
    private static CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
    private static cache = new Map<string, CacheEntry>(); // Key: "lat,lon" (rounded to 3 decimal places)

    /**
     * Get Administrative Block Info from Coordinates
     * Orchestrates API calls, caching, and fallback logic.
     */
    static async getBlockFromCoords(lat: number, lon: number): Promise<BlockInfo> {
        const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;

        // 1. Check Memory Cache
        const cached = this.cache.get(cacheKey);
        if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
            console.log(`[LocationService] Cache Hit for ${cacheKey}`);
            return { ...cached.data, source: 'CACHE' };
        }

        try {
            // 2. Try Nominatim API (OpenStreetMap)
            // Note: In production, ensure you respect usage policy (User-Agent, rate limits)
            const url = `https://nominatim.openstreetmap.org/reverse`;
            const response = await axios.get(url, {
                params: {
                    format: 'json',
                    lat,
                    lon,
                    addressdetails: 1,
                    zoom: 14 // Block/Village level
                },
                headers: {
                    'User-Agent': 'AquaSutra-Backend/1.0'
                },
                timeout: 3000
            });

            const addr = response.data.address;

            if (addr && (addr.postcode || addr.state_district)) {
                // Determine Block/Taluka
                // OSM variable mapping is tricky. 'county' or 'town' often holds the Block name in India.
                const possibleBlock = addr.county || addr.town || addr.city || addr.suburb || 'Unknown';
                const district = addr.state_district || addr.district || 'Unknown';
                const state = addr.state || 'Unknown';
                const pincode = addr.postcode || this.findNearestPincode(lat, lon); // Fallback if API returns no postcode

                const result: BlockInfo = {
                    pincode,
                    district,
                    block: possibleBlock,
                    state,
                    confidence: 90,
                    source: 'API'
                };

                // Save to Cache
                this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
                return result;
            }

            throw new Error("Nominatim returned incomplete address");

        } catch (error) {
            console.warn(`[LocationService] API failed for ${lat},${lon}. Using Fallback.`);

            // 3. Fallback: Find Nearest Pincode from local Dataset
            const nearestPincode = this.findNearestPincode(lat, lon);
            const fallbackData = this.getDistrictFromPincode(nearestPincode);

            const result: BlockInfo = {
                pincode: nearestPincode,
                district: fallbackData?.district || 'Unknown',
                block: fallbackData?.block || 'Unknown',
                state: fallbackData?.state || 'Unknown',
                confidence: 40, // Low confidence since it's a proximity guess
                source: 'FALLBACK_NEAREST'
            };

            this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
            return result;
        }
    }

    /**
     * Get info from Pincode using local JSON
     */
    static getDistrictFromPincode(pincode: string) {
        return pincodeData[pincode] || null;
    }

    /**
     * Find nearest known pincode based on distance to mocked coordinates.
     * Since pincodeMapping.json doesn't have lat/lon, we roughly map
     * Prayagraj blocks to a central point for checking.
     */
    private static findNearestPincode(lat: number, lon: number): string {
        // Mock Central Coordinates for Blocks to calculate distance
        const blockCenters: Record<string, { lat: number, lon: number, pin: string }> = {
            'Chaka': { lat: 25.42, lon: 81.84, pin: '211008' }, // Naini area
            'Sahson': { lat: 25.55, lon: 81.95, pin: '211012' },
            'Koraon': { lat: 24.98, lon: 82.06, pin: '211015' }
        };

        let minDist = Infinity;
        let bestPin = '211001'; // Default Civil Lines

        for (const key in blockCenters) {
            const center = blockCenters[key];
            const dist = this.haversine(lat, lon, center.lat, center.lon);
            if (dist < minDist) {
                minDist = dist;
                bestPin = center.pin;
            }
        }

        // If really far (>100km), just return a default
        if (minDist > 100) return '211001';
        return bestPin;
    }

    // Haversine Distance in KM
    private static haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Radius of the earth in km
        const dLat = this.deg2rad(lat2 - lat1);
        const dLon = this.deg2rad(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private static deg2rad(deg: number): number {
        return deg * (Math.PI / 180);
    }
}
