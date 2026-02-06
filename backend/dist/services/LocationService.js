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
exports.LocationService = void 0;
const axios_1 = __importDefault(require("axios"));
const PincodeService_1 = require("./PincodeService");
class LocationService {
    /**
     * Get Administrative Block Info from Coordinates
     * Orchestrates API calls, caching, and fallback logic.
     */
    static getBlockFromCoords(lat, lon) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheKey = `${lat.toFixed(3)},${lon.toFixed(3)}`;
            // 1. Check Memory Cache
            const cached = this.cache.get(cacheKey);
            if (cached && (Date.now() - cached.timestamp < this.CACHE_TTL)) {
                console.log(`[LocationService] Cache Hit for ${cacheKey}`);
                return Object.assign(Object.assign({}, cached.data), { source: 'CACHE' });
            }
            try {
                // 2. Try Nominatim API (OpenStreetMap)
                // Note: In production, ensure you respect usage policy (User-Agent, rate limits)
                const url = `https://nominatim.openstreetmap.org/reverse`;
                const response = yield axios_1.default.get(url, {
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
                    const possibleBlock = addr.county || addr.town || addr.city || addr.suburb || 'Unknown';
                    const district = addr.state_district || addr.district || 'Unknown';
                    const state = addr.state || 'Unknown';
                    // Fallback to spatial search if API returns no postcode
                    let pincode = addr.postcode;
                    if (!pincode) {
                        const nearest = PincodeService_1.PincodeService.getNearestPincodeBlock(lat, lon);
                        if (nearest)
                            pincode = nearest.pincode;
                    }
                    const result = {
                        pincode: pincode || 'Unknown',
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
            }
            catch (error) {
                console.warn(`[LocationService] API failed for ${lat},${lon}. Using PincodeService Fallback.`);
                // 3. Fallback: Find Nearest Pincode via PincodeService
                const nearest = PincodeService_1.PincodeService.getNearestPincodeBlock(lat, lon);
                if (nearest) {
                    const result = {
                        pincode: nearest.pincode,
                        district: nearest.district,
                        block: nearest.block,
                        state: nearest.state,
                        confidence: 50, // Moderate confidence (Spatial Match)
                        source: 'FALLBACK_NEAREST'
                    };
                    this.cache.set(cacheKey, { data: result, timestamp: Date.now() });
                    return result;
                }
                // Absolute Worst Case
                return {
                    pincode: 'Unknown',
                    district: 'Unknown',
                    block: 'Unknown',
                    state: 'Unknown',
                    confidence: 0,
                    source: 'FALLBACK_NEAREST'
                };
            }
        });
    }
    static getDistrictFromPincode(pincode) {
        return __awaiter(this, void 0, void 0, function* () {
            // Mock implementation
            if (pincode === '421503') {
                return {
                    pincode,
                    district: 'Thane',
                    block: 'Badlapur',
                    state: 'Maharashtra',
                    confidence: 100,
                    source: 'CACHE'
                };
            }
            return {
                pincode,
                district: 'Prayagraj', // Default fallback
                block: 'Chaka',
                state: 'Uttar Pradesh',
                confidence: 50,
                source: 'FALLBACK_NEAREST'
            };
        });
    }
}
exports.LocationService = LocationService;
// 7 Days Cache TTL
LocationService.CACHE_TTL = 7 * 24 * 60 * 60 * 1000;
LocationService.cache = new Map(); // Key: "lat,lon" (rounded to 3 decimal places)
