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
exports.HydroEconomicEngine = void 0;
const MarketPriceService_1 = require("./MarketPriceService");
const WaterCostCalculator_1 = require("./WaterCostCalculator");
const YieldAdjustmentService_1 = require("./YieldAdjustmentService");
const CropRiskAssessment_1 = require("./CropRiskAssessment");
const CGWBService_1 = require("./CGWBService");
const LocationService_1 = require("./LocationService");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const CropDatabase_1 = require("../data/CropDatabase");
class HydroEconomicEngine {
    // --- Core Logic ---
    getWaterBucketSize(soilType, depthCm = 100) {
        const type = soilType.toLowerCase();
        let awcPerMeter = 140; // Default Medium
        if (type.includes('sand'))
            awcPerMeter = 100;
        else if (type.includes('clay') || type.includes('black'))
            awcPerMeter = 200;
        else if (type.includes('loam'))
            awcPerMeter = 180;
        return (awcPerMeter * depthCm) / 100;
    }
    getZoneFromPincode(pincode) {
        const prefix = parseInt(pincode.substring(0, 3));
        if (prefix >= 440 && prefix <= 445)
            return 'Vidarbha';
        if (prefix >= 431 && prefix <= 436)
            return 'Marathwada';
        if (prefix >= 410 && prefix <= 416)
            return 'Western Maharashtra';
        if (prefix >= 424 && prefix <= 425)
            return 'Northern Maharashtra';
        return 'General';
    }
    checkClimateStress(crop, lat) {
        return true;
    }
    findCropIdByName(name) {
        if (!name)
            return undefined;
        const needle = name.toLowerCase();
        const found = CropDatabase_1.CROP_DATABASE.find(c => c.name.toLowerCase().includes(needle) || c.id === needle);
        return found === null || found === void 0 ? void 0 : found.id;
    }
    calculateSoilLegacyBonus(crop, prevCropId) {
        if (!prevCropId)
            return 1.0;
        const prevCrop = CropDatabase_1.CROP_DATABASE.find(c => c.id === prevCropId);
        if ((prevCrop === null || prevCrop === void 0 ? void 0 : prevCrop.isLegume) && !crop.isLegume)
            return 1.15;
        if (prevCropId === crop.id)
            return 0.85;
        return 1.0;
    }
    // --- GOLD-TIER LOGIC ---
    calculateEnhancedProfitMetrics(crop, context) {
        return __awaiter(this, void 0, void 0, function* () {
            const revenue = context.adjustedYield * context.marketPrice;
            const totalCost = crop.inputCost + context.waterCost.totalCostSeason;
            const netProfit = revenue - totalCost;
            // DEBUG LOGGING
            const fs = require('fs');
            const path = require('path');
            const logPath = path.join(__dirname, '../../server_debug.log');
            const logMsg = `[ProfitCalc] ${crop.name}: Yield=${context.adjustedYield}T, Price=${context.marketPrice}, Rev=${Math.round(revenue)}, Cost=${Math.round(totalCost)} (Input=${crop.inputCost} + Water=${context.waterCost.totalCostSeason}), Net=${Math.round(netProfit)}\n`;
            try {
                fs.appendFileSync(logPath, logMsg);
            }
            catch (e) { }
            const profitPerMm = crop.waterConsumptionMm > 0 ? netProfit / crop.waterConsumptionMm : 0;
            const timeFactor = 365 / crop.durationDays;
            const profitIndex = profitPerMm * timeFactor;
            return {
                profitIndex: Math.round(profitIndex),
                netProfit: Math.round(netProfit),
                totalCost: Math.round(totalCost),
                revenue: Math.round(revenue)
            };
        });
    }
    getDistrictFromPincode(pincode) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const blockInfo = yield LocationService_1.LocationService.getDistrictFromPincode(pincode);
                // MarketPriceService works best with State names for the API
                return (blockInfo === null || blockInfo === void 0 ? void 0 : blockInfo.state) || 'Uttar Pradesh';
            }
            catch (_a) {
                return 'Uttar Pradesh';
            }
        });
    }
    calculateEnhancedImpact(intentId, recommendedCrop, areaAcres, metrics) {
        const intentCrop = CropDatabase_1.CROP_DATABASE.find(c => c.id === intentId);
        if (!intentCrop)
            return undefined;
        const diffMm = intentCrop.waterConsumptionMm - recommendedCrop.waterConsumptionMm;
        const effectiveAcres = areaAcres > 0 ? areaAcres : 1;
        const totalLitersSaved = diffMm * 4046.86 * effectiveAcres;
        if (totalLitersSaved <= 0)
            return undefined;
        return {
            totalLiters: Math.round(totalLitersSaved),
            drinkingWaterDays: Math.round(totalLitersSaved / 500),
            pondsFilled: parseFloat((totalLitersSaved / 1000000).toFixed(1)),
            extraAcres: parseFloat((totalLitersSaved / (recommendedCrop.waterConsumptionMm * 4046.86)).toFixed(1)),
            comparison: {
                intentCropName: intentCrop.name,
                intentWaterMm: intentCrop.waterConsumptionMm,
                intentProfitIndex: metrics.intentMetrics.profitIndex,
                recommendedProfitIndex: metrics.recommendedMetrics.profitIndex,
                intentRiskScore: metrics.intentRisk.riskScore,
                recommendedRiskScore: metrics.recommendedRisk.riskScore,
                savingsBreakdown: {
                    waterCostSaved: metrics.waterCostSaved,
                    yieldImprovement: metrics.recommendedMetrics.netProfit - metrics.intentMetrics.netProfit,
                    riskReduction: metrics.intentRisk.riskScore - metrics.recommendedRisk.riskScore
                }
            }
        };
    }
    // --- MAIN API ---
    getRecommendations(ctx, userIntentName, limitToCrops // NEW: specific crops to evaluate (bypassing filters)
    ) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`🔍 [HydroEconomic] Starting enhanced recommendations for ${ctx.pincode || 'unknown location'}`);
            const log = (msg) => {
                try {
                    fs_1.default.appendFileSync(path_1.default.join(__dirname, '../../server_debug.log'), `[HydroEngine] ${new Date().toISOString()} ${msg}\n`);
                }
                catch (e) { /* ignore */ }
            };
            log('STEP 1: Fetching Market Prices');
            // STEP 1: Fetch live market prices
            const district = ctx.pincode ? yield this.getDistrictFromPincode(ctx.pincode) : 'Prayagraj';
            const cropIds = CropDatabase_1.CROP_DATABASE.map(c => c.id);
            let marketPrices;
            let dataQuality = 50;
            try {
                log('Calling MarketPriceService.getAllCropPrices');
                marketPrices = yield MarketPriceService_1.MarketPriceService.getAllCropPrices(district, cropIds);
                log('MarketPriceService returned');
                dataQuality = 90;
            }
            catch (error) {
                log(`MARKET FAILURE: ${error}`);
                marketPrices = {};
                CropDatabase_1.CROP_DATABASE.forEach(crop => {
                    marketPrices[crop.id] = {
                        currentPrice: crop.baseMarketPrice, // DB is now normalized to INR/Ton
                        msp: MarketPriceService_1.MarketPriceService.getMSP(crop.id),
                        trend: 'STABLE',
                        lastUpdated: new Date()
                    };
                });
            }
            log('STEP 2: Groundwater Depth');
            // STEP 2: Get groundwater depth 
            let waterTableDepth = 20;
            if (ctx.lat && ctx.lon) {
                try {
                    const gwLevel = yield CGWBService_1.CGWBService.getGroundwaterLevel(ctx.lat, ctx.lon);
                    waterTableDepth = typeof gwLevel === 'number' ? gwLevel : 20;
                }
                catch (error) {
                    log(`CGWB FAILURE: ${error}`);
                }
            }
            log('STEP 3: Block Classification');
            // STEP 3: Get CGWB block classification
            let blockClassification = 'Unknown';
            if (ctx.district && ctx.block) {
                try {
                    const cgwbStatus = yield CGWBService_1.CGWBService.getBlockWaterStatus(ctx.district, ctx.block);
                    blockClassification = cgwbStatus.classification;
                }
                catch (error) {
                    log(`CGWB BLOCK FAILURE: ${error}`);
                }
            }
            log('STEP 4: Available Water');
            // STEP 4: Calculate available water
            const zone = this.getZoneFromPincode(ctx.pincode);
            const bucketSize = this.getWaterBucketSize(ctx.soilType, ctx.soilDepth);
            const expectedRainfall = 500;
            const waterAvailable = bucketSize + expectedRainfall;
            log('STEP 5: User Intent');
            // STEP 5: Resolve user intent & Pre-calculate context
            const prevCropId = this.findCropIdByName(ctx.previousCropId || '');
            const intentCropId = this.findCropIdByName(userIntentName || '');
            let intentContext = null;
            if (intentCropId) {
                const iCrop = CropDatabase_1.CROP_DATABASE.find(c => c.id === intentCropId);
                if (iCrop) {
                    const iPriceData = marketPrices[intentCropId];
                    const iPrice = (iPriceData === null || iPriceData === void 0 ? void 0 : iPriceData.currentPrice) || iCrop.baseMarketPrice;
                    const iYieldAdj = YieldAdjustmentService_1.YieldAdjustmentService.adjustYieldForWaterStress(iCrop.baseYieldTons, iCrop.waterConsumptionMm, waterAvailable, YieldAdjustmentService_1.YieldAdjustmentService.getCropCategory(iCrop.id));
                    const iWaterCost = WaterCostCalculator_1.WaterCostCalculator.calculateWaterCost(iCrop.waterConsumptionMm, 1, 'ELECTRIC', waterTableDepth // per-acre
                    );
                    const iProfit = yield this.calculateEnhancedProfitMetrics(iCrop, {
                        marketPrice: (iPriceData === null || iPriceData === void 0 ? void 0 : iPriceData.msp) ? Math.max(iPrice, iPriceData.msp) : iPrice,
                        adjustedYield: iYieldAdj.adjustedYield,
                        waterCost: iWaterCost
                    });
                    const iRisk = CropRiskAssessment_1.CropRiskAssessment.assessRisk(iCrop, {
                        blockClassification, waterAvailability: waterAvailable, soilType: ctx.soilType,
                        marketTrend: (iPriceData === null || iPriceData === void 0 ? void 0 : iPriceData.trend) || 'STABLE', marketVolatility: 10, waterTableDepth, previousCropId: prevCropId
                    });
                    intentContext = {
                        crop: iCrop,
                        metrics: iProfit,
                        risk: iRisk,
                        waterCost: iWaterCost
                    };
                }
            }
            // STEP 6: Process each crop
            const results = [];
            for (const crop of CropDatabase_1.CROP_DATABASE) {
                // OPTIMIZATION: If specific crops requested, skip others
                if (limitToCrops && !limitToCrops.includes(crop.id))
                    continue;
                const isZoneMatch = crop.zones.length === 0 || crop.zones.includes(zone) || crop.zones.includes('General') || zone === 'General';
                // STRICT FILTERS (Only apply if NOT in "Force/Compare" mode)
                if (!limitToCrops) {
                    if (!isZoneMatch)
                        continue;
                    if (!this.checkClimateStress(crop, ctx.lat))
                        continue;
                    if (!crop.soilTypes.includes(ctx.soilType))
                        continue;
                }
                else {
                    // If force-comparing, we still record the mismatch logic later in Risk Assessment
                    // We just don't 'continue' here
                }
                // 1. GET PRICE
                const priceData = marketPrices[crop.id];
                const marketPrice = (priceData === null || priceData === void 0 ? void 0 : priceData.currentPrice) || crop.baseMarketPrice;
                const msp = (priceData === null || priceData === void 0 ? void 0 : priceData.msp) || null;
                const priceTrend = (priceData === null || priceData === void 0 ? void 0 : priceData.trend) || 'STABLE';
                const finalPrice = msp ? Math.max(marketPrice, msp) : marketPrice;
                // 2. ADJUST YIELD
                const cropCategory = YieldAdjustmentService_1.YieldAdjustmentService.getCropCategory(crop.id);
                const yieldAdjustment = YieldAdjustmentService_1.YieldAdjustmentService.adjustYieldForWaterStress(crop.baseYieldTons, crop.waterConsumptionMm, waterAvailable, cropCategory);
                // 3. CALCULATE WATER COST (per acre, for comparable profit index)
                const waterCost = WaterCostCalculator_1.WaterCostCalculator.calculateWaterCost(crop.waterConsumptionMm, 1, // Calculate per-acre cost for profitability comparison
                'ELECTRIC', waterTableDepth);
                // 4. CALCULATE TRUE PROFIT
                const profitMetrics = yield this.calculateEnhancedProfitMetrics(crop, {
                    marketPrice: finalPrice,
                    adjustedYield: yieldAdjustment.adjustedYield,
                    waterCost: waterCost
                });
                // 5. RISK ASSESSMENT
                const riskAssessment = CropRiskAssessment_1.CropRiskAssessment.assessRisk(crop, {
                    blockClassification,
                    waterAvailability: waterAvailable,
                    soilType: ctx.soilType,
                    marketTrend: priceTrend,
                    marketVolatility: 10,
                    waterTableDepth,
                    previousCropId: prevCropId
                });
                // 6. SCORES
                const viabilityScore = Math.max(0, 100 - riskAssessment.riskScore);
                // 7. SMART SWAP DETECTION
                let isSmartSwap = false;
                let waterSavings = 0;
                const reasons = [];
                if (intentContext && crop.id !== intentCropId) {
                    const userCrop = intentContext.crop;
                    const savingsMm = userCrop.waterConsumptionMm - crop.waterConsumptionMm;
                    waterSavings = (savingsMm / userCrop.waterConsumptionMm) * 100;
                    if (waterSavings > 20 && (profitMetrics.profitIndex >= intentContext.metrics.profitIndex * 0.8 ||
                        riskAssessment.riskScore < intentContext.risk.riskScore - 20)) {
                        isSmartSwap = true;
                        reasons.push(`💧 Saves ${Math.round(waterSavings)}% water`);
                        if (profitMetrics.profitIndex > intentContext.metrics.profitIndex) {
                            let profitGain = 0;
                            if (intentContext.metrics.profitIndex <= 0) {
                                // If base crop is making a loss, profit gain is conceptually infinite/massive
                                reasons.push(`💰 Turns loss into profit`);
                            }
                            else {
                                profitGain = ((profitMetrics.profitIndex / intentContext.metrics.profitIndex - 1) * 100);
                                reasons.push(`💰 ${profitGain.toFixed(0)}% higher profit/drop`);
                            }
                        }
                        if (riskAssessment.riskScore < intentContext.risk.riskScore - 10) {
                            reasons.push(`✅ ${intentContext.risk.riskScore - riskAssessment.riskScore} points lower risk`);
                        }
                    }
                }
                if (yieldAdjustment.reductionPercent > 20) {
                    reasons.push(`⚠️ ${yieldAdjustment.reductionPercent.toFixed(0)}% yield loss due to water stress`);
                }
                if (riskAssessment.riskLevel === 'HIGH' || riskAssessment.riskLevel === 'EXTREME') {
                    reasons.push(...riskAssessment.recommendations.slice(0, 2));
                }
                if (priceTrend === 'UP')
                    reasons.push(`📈 Prices rising - good timing`);
                results.push({
                    cropId: crop.id,
                    name: crop.name,
                    profitIndex: profitMetrics.profitIndex,
                    waterSavings: Math.round(waterSavings),
                    viabilityScore: viabilityScore,
                    isSmartSwap: isSmartSwap,
                    reason: reasons,
                    marketPrice: finalPrice,
                    msp: msp,
                    priceTrend: priceTrend,
                    adjustedYield: yieldAdjustment.adjustedYield,
                    yieldReduction: yieldAdjustment.reductionPercent,
                    waterCost: waterCost,
                    riskAssessment: riskAssessment,
                    debug: {
                        bucketSize: bucketSize,
                        projectedRevenue: profitMetrics.revenue,
                        waterCost: crop.waterConsumptionMm,
                        baseYield: crop.baseYieldTons,
                        adjustedYield: yieldAdjustment.adjustedYield,
                        baseMarketPrice: crop.baseMarketPrice * 10,
                        liveMarketPrice: finalPrice,
                        totalInputCost: profitMetrics.totalCost,
                        netProfit: profitMetrics.netProfit,
                        riskScore: riskAssessment.riskScore,
                        dataQuality: dataQuality
                    },
                    impact: isSmartSwap && intentContext ?
                        this.calculateEnhancedImpact(intentCropId, crop, ctx.totalLandArea, {
                            intentMetrics: intentContext.metrics,
                            intentRisk: intentContext.risk,
                            recommendedMetrics: profitMetrics,
                            recommendedRisk: riskAssessment,
                            waterCostSaved: intentContext.waterCost.totalCostSeason - waterCost.totalCostSeason
                        }) : undefined
                });
            }
            // Final Sort
            results.sort((a, b) => {
                if (a.isSmartSwap && !b.isSmartSwap)
                    return -1;
                if (!a.isSmartSwap && b.isSmartSwap)
                    return 1;
                if (Math.abs(a.profitIndex - b.profitIndex) > 10)
                    return b.profitIndex - a.profitIndex;
                return a.riskAssessment.riskScore - b.riskAssessment.riskScore;
            });
            // Champion Logic
            if (results.length > 0 && intentCropId) {
                const top = results[0];
                if (top.cropId !== intentCropId && !top.isSmartSwap) {
                    top.isSmartSwap = true;
                    top.reason.unshift(`🏆 Top Recommendation`);
                }
            }
            console.log(`\n✅ [HydroEconomic] Generated ${results.length} recommendations`);
            if (results.length > 0) {
                console.log(`🏆 Winner: ${results[0].name} (₹${results[0].profitIndex}/mm, ${results[0].riskAssessment.riskLevel} risk)`);
            }
            return results;
        });
    }
}
exports.HydroEconomicEngine = HydroEconomicEngine;
