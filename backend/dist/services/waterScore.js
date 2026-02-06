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
exports.calculateWaterBalance = void 0;
const axios_1 = __importDefault(require("axios"));
const CGWBService_1 = require("./CGWBService");
const LocationService_1 = require("./LocationService");
const NASAGRACEService_1 = require("./NASAGRACEService");
const calculateWaterBalance = (lat_1, lon_1, ...args_1) => __awaiter(void 0, [lat_1, lon_1, ...args_1], void 0, function* (lat, lon, soilType = 'Medium Black', contextBlockInfo) {
    var _a;
    // 1. Resolve Admin Location & Hydro Data
    let district = 'Unknown';
    let block = 'Unknown';
    let classification = 'Unknown';
    let actualDepth = 10;
    let villageLabel = 'Unknown Village';
    if (contextBlockInfo) {
        // Fast Path: Use provided Pincode Data
        console.log(`[WaterScore] Using Context Block: ${contextBlockInfo.block}`);
        district = contextBlockInfo.district;
        block = contextBlockInfo.block;
        classification = contextBlockInfo.classification;
        actualDepth = contextBlockInfo.waterTableDepth;
        villageLabel = `${block}, ${district} (Pin: ${contextBlockInfo.pincode})`;
    }
    else {
        // Slow Path: Geocode coordinates
        const locationInfo = yield LocationService_1.LocationService.getBlockFromCoords(lat, lon);
        district = locationInfo.district;
        block = locationInfo.block;
        villageLabel = locationInfo.block !== 'Unknown' ? `${locationInfo.block}, ${locationInfo.district}` : 'Unknown Village';
        // Fetch Hydro Data separately since not provided
        const blockStatus = yield CGWBService_1.CGWBService.getBlockWaterStatus(district, block);
        classification = blockStatus.classification;
        // Determine Actual Depth: Use local specific if known, otherwise API/Fallback
        let localDepth = yield CGWBService_1.CGWBService.getGroundwaterLevel(lat, lon);
        if (blockStatus.waterTableDepth > localDepth) {
            localDepth = blockStatus.waterTableDepth;
        }
        actualDepth = localDepth;
    }
    // 2. Trend Analysis (CGWB Historical) - Common Path
    let avgDeclinePercent = 0;
    try {
        const trends = yield CGWBService_1.CGWBService.getHistoricalTrends(district, block, 5);
        if (trends.length > 0) {
            const totalDecline = trends.reduce((acc, t) => acc + (t.change > 0 ? t.change : 0), 0);
            const initialLevel = trends[0].level;
            avgDeclinePercent = (totalDecline / initialLevel) * 100;
        }
    }
    catch (e) {
        console.warn("Failed to fetch trends", e);
    }
    // 3. Satellite Validation (NASA GRACE)
    const graceData = NASAGRACEService_1.NASAGRACEService.getGroundwaterAnomaly(lat, lon);
    const satelliteTrend = NASAGRACEService_1.NASAGRACEService.getAnomalyTrend(lat, lon);
    // Scientific Constants for Hard Rock (Basalt) Terrain
    const SPECIFIC_YIELD = 0.02; // 2% for Basalt/Hard Rock
    const CropWaterDemand_mm_per_day = 4; // Avg for Rabi crops
    // 4. Infiltration Tuning based on Block Status
    let infiltrationFactor = 0.10; // Default: Medium Black Soil
    const soilLower = soilType.toLowerCase();
    if (soilLower.includes('clay') || soilLower.includes('black')) {
        infiltrationFactor = 0.05; // 5% recharge (Heavy Runoff)
    }
    else if (soilLower.includes('red') || soilLower.includes('sandy') || soilLower.includes('loam')) {
        infiltrationFactor = 0.15; // 15% recharge (Better Permeability)
    }
    if (classification === 'Over-exploited') {
        infiltrationFactor *= 0.7;
    }
    else if (classification === 'Critical') {
        infiltrationFactor *= 0.85;
    }
    // 5. Fetch Hydrological Data (Rain + ET0)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);
    const formatDate = (date) => date.toISOString().split('T')[0];
    let totalRainfall = 0;
    try {
        const historyUrl = `https://archive-api.open-meteo.com/v1/archive`;
        const response = yield axios_1.default.get(historyUrl, {
            params: {
                latitude: lat,
                longitude: lon,
                start_date: formatDate(startDate),
                end_date: formatDate(endDate),
                daily: 'precipitation_sum,et0_fao_evapotranspiration',
                timezone: 'auto'
            }
        });
        if (response.data.daily) {
            const rains = response.data.daily.precipitation_sum || [];
            totalRainfall = rains.reduce((acc, val) => acc + (val || 0), 0);
        }
    }
    catch (error) {
        console.error("Failed to fetch historical rain:", error);
        totalRainfall = 400; // Fallback
    }
    // 6. Fetch Deep Soil Moisture (Open Meteo)
    let soilMoistureIndex = 0.3;
    try {
        const forecastUrl = `https://api.open-meteo.com/v1/forecast`;
        const response = yield axios_1.default.get(forecastUrl, {
            params: {
                latitude: lat,
                longitude: lon,
                current: 'soil_moisture_28_to_100cm'
            }
        });
        if ((_a = response.data.current) === null || _a === void 0 ? void 0 : _a.soil_moisture_28_to_100cm) {
            soilMoistureIndex = response.data.current.soil_moisture_28_to_100cm;
        }
    }
    catch (error) {
        console.error("Failed to fetch soil moisture:", error);
    }
    // 7. Calculate Net Water Balance
    const groundwaterRecharge = totalRainfall * infiltrationFactor;
    // Base Storage
    const aquiferDepth_mm = actualDepth * 1000;
    let currentStorage_mm = aquiferDepth_mm * SPECIFIC_YIELD * soilMoistureIndex;
    // Apply GRACE Correction (The "Invisible" Check)
    if (graceData) {
        const anomaly_mm = graceData.anomaly_cm * 10;
        currentStorage_mm += anomaly_mm;
        if (currentStorage_mm < 0)
            currentStorage_mm = 0;
    }
    // Apply Trend Penalty (CGWB)
    if (avgDeclinePercent > 10) {
        const penaltyFactor = avgDeclinePercent / 100;
        currentStorage_mm = currentStorage_mm * (1 - penaltyFactor);
    }
    let netBalance_mm = Math.round(currentStorage_mm + groundwaterRecharge);
    const daysLeft = Math.round(netBalance_mm / CropWaterDemand_mm_per_day);
    // 8. Determine Status and Message
    let status = 'Adequate';
    let message = `Sufficient for ~${daysLeft} days.`;
    // Priority: Government/Physical Reality > Theoretical Math
    if (classification === 'Over-exploited') {
        if (daysLeft > 90) {
            status = 'Deficit';
            message = `Govt Alert: Block is Over-exploited. Use water cautiously.`;
        }
        else {
            status = 'Critical';
            message = `CRITICAL: Block is Over-exploited. Groundwater depletion imminent.`;
        }
    }
    else if (graceData && graceData.anomaly_cm < -10 && daysLeft < 60) {
        // Satellite Double-Check
        status = 'Critical';
        message = `NASA Alert: Satellite detects severe depletion (${graceData.anomaly_cm}cm).`;
    }
    else if (daysLeft > 150) {
        status = 'Surplus';
        message = `Excellent levels (${daysLeft} days). Safe for Sugarcane.`;
    }
    else if (daysLeft < 45) {
        status = 'Critical';
        message = `Critical alert (${daysLeft} days). Stop irrigation.`;
    }
    else if (daysLeft < 90) {
        status = 'Deficit';
        message = `Low levels (${daysLeft} days). Use drip irrigation.`;
    }
    return {
        balance_mm: netBalance_mm,
        rainfall_6m_mm: Math.round(totalRainfall),
        soil_moisture_index: soilMoistureIndex,
        status,
        message,
        villageName: villageLabel,
        cgwbClassification: classification,
        blockName: block,
        actualWaterTableDepth: actualDepth,
        rechargeTrend: parseFloat(avgDeclinePercent.toFixed(1)),
        // GRACE Fields
        graceAnomaly_cm: graceData ? graceData.anomaly_cm : undefined,
        satelliteTrend_cm_yr: satelliteTrend
    };
});
exports.calculateWaterBalance = calculateWaterBalance;
