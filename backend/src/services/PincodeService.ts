
import pincodeDataRaw from '../data/india_pincode_blocks.json';

// Interfaces matching the JSON structure
export interface PincodeRecord {
    pincode: string;
    district: string;
    block: string;
    state: string;
    tehsil: string;
    latitude: number;
    longitude: number;
    cgwb_classification: string;
    nearest_observation_wells: string[];
    avg_water_table_depth_m: number;
}

export interface BlockInfo {
    pincode: string;
    district: string;
    block: string;
    state: string;
    classification: string;
    waterTableDepth: number;
    distance_km?: number;
}

// Type assertion for the imported JSON
const rawMappings = (pincodeDataRaw as any).mappings as PincodeRecord[];

export class PincodeService {
    // In-memory cache for O(1) lookups
    private static pincodeMap = new Map<string, PincodeRecord>();
    private static isInitialized = false;

    /**
     * Initialize the cache (Map) for fast access
     */
    private static initialize() {
        if (this.isInitialized) return;

        rawMappings.forEach(record => {
            this.pincodeMap.set(record.pincode, record);
        });
        this.isInitialized = true;
        console.log(`[PincodeService] Initialized with ${this.pincodeMap.size} records.`);
    }

    /**
     * Get details for a specific Pincode (O(1) lookup)
     */
    static getBlockByPincode(pincode: string): BlockInfo | null {
        this.initialize();
        const record = this.pincodeMap.get(pincode);
        if (!record) return null;

        return {
            pincode: record.pincode,
            district: record.district,
            block: record.block,
            state: record.state,
            classification: record.cgwb_classification,
            waterTableDepth: record.avg_water_table_depth_m
        };
    }

    /**
     * Find the nearest mapped Block/Pincode to the given coordinates (Spatial Search)
     * Limit search to 50km radius.
     */
    static getNearestPincodeBlock(lat: number, lon: number): BlockInfo | null {
        this.initialize();

        let nearestDist = Infinity;
        let nearestRecord: PincodeRecord | null = null;
        const SEARCH_RADIUS_KM = 50;

        // Linear scan of 30 records is instantaneous. 
        // For 30,000 records, we would use an R-Tree or Grid Bucket.
        for (const record of rawMappings) {
            const dist = this.haversine(lat, lon, record.latitude, record.longitude);
            if (dist < nearestDist) {
                nearestDist = dist;
                nearestRecord = record;
            }
        }

        if (nearestRecord && nearestDist <= SEARCH_RADIUS_KM) {
            return {
                pincode: nearestRecord.pincode,
                district: nearestRecord.district,
                block: nearestRecord.block,
                state: nearestRecord.state,
                classification: nearestRecord.cgwb_classification,
                waterTableDepth: nearestRecord.avg_water_table_depth_m,
                distance_km: parseFloat(nearestDist.toFixed(2))
            };
        }

        return null; // No match within range
    }

    /**
     * Get all Pincodes belonging to a District
     */
    static searchPincodesByDistrict(district: string): PincodeRecord[] {
        // No index needed for small dataset, filter is fast enough
        const normalizedQuery = district.toLowerCase();
        return rawMappings.filter(r => r.district.toLowerCase() === normalizedQuery);
    }

    static getCGWBClassification(pincode: string): string {
        const info = this.getBlockByPincode(pincode);
        return info ? info.classification : 'Unknown';
    }

    static getWaterTableDepth(pincode: string): number {
        const info = this.getBlockByPincode(pincode);
        return info ? info.waterTableDepth : 10; // Default 10m
    }

    // --- Helpers ---

    /**
     * Haversine Formula to calculate distance between two lat/lon points in km
     */
    private static haversine(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth Radius in Km
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
