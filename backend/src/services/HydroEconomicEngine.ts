import { MarketPriceService } from './MarketPriceService';

type CropPriceMap = Record<string, { currentPrice: number; msp: number; trend: 'UP' | 'DOWN' | 'STABLE'; lastUpdated: Date; }>;
import { WaterCostCalculator, WaterCostBreakdown } from './WaterCostCalculator';
import { YieldAdjustmentService } from './YieldAdjustmentService';
import { CropRiskAssessment, RiskAssessment } from './CropRiskAssessment';
import { CGWBService } from './CGWBService';
import { LocationService } from './LocationService';
import fs from 'fs';
import path from 'path';

export interface CropConfig {
    id: string;
    name: string;
    durationDays: number;
    waterConsumptionMm: number; // Total water needed per acre in mm
    minTemp: number;
    maxTemp: number;
    baseYieldTons: number; // Avg yield per acre
    baseMarketPrice: number; // INR per ton
    inputCost: number; // INR per acre
    soilTypes: string[]; // Compatible soil types
    zones: string[]; // Preferred Agro-Climatic Zones
    isLegume: boolean; // For soil recovery logic
}

export interface FarmContext {
    pincode: string;
    district?: string;
    block?: string;
    lat: number;
    lon: number;
    soilType: string; // e.g., 'Clay', 'Sandy'
    soilDepth?: number; // cm
    previousCropId?: string;
    totalLandArea: number; // Acres
}

export interface RecommendationResult {
    cropId: string;
    name: string;
    profitIndex: number; // The Hero Metric
    waterSavings: number; // % relative to baseline or user intent
    viabilityScore: number; // 0-100
    isSmartSwap: boolean;
    reason: string[];

    // NEW FIELDS (GOLD-TIER):
    marketPrice: number;              // Live market price used
    msp: number | null;               // Government MSP
    priceTrend: 'UP' | 'DOWN' | 'STABLE' | null;
    adjustedYield: number;            // After water stress adjustment
    yieldReduction: number;           // % yield loss due to water stress
    waterCost: WaterCostBreakdown;    // Detailed water extraction costs
    riskAssessment: RiskAssessment;   // Complete risk analysis

    debug: {
        bucketSize: number;
        projectedRevenue: number;
        waterCost: number;
        // NEW DEBUG FIELDS:
        baseYield: number;
        adjustedYield: number;
        baseMarketPrice: number;
        liveMarketPrice: number;
        totalInputCost: number;         // Includes water extraction
        netProfit: number;
        riskScore: number;
        dataQuality: number;            // 0-100 (live data vs fallback)
    };

    impact?: {
        totalLiters: number;
        drinkingWaterDays: number;
        pondsFilled: number;
        extraAcres: number;
        comparison?: {
            intentCropName: string;
            intentWaterMm: number;
            intentProfitIndex: number;
            recommendedProfitIndex: number;
            // NEW IMPACT FIELDS:
            intentRiskScore: number;
            recommendedRiskScore: number;
            savingsBreakdown: {
                waterCostSaved: number;
                yieldImprovement: number;
                riskReduction: number;
            };
        };
    };
}

// EXTENDED CROP DATABASE (20+ Crops)
export const CROP_DATABASE: CropConfig[] = [
    // --- FIBER & CASH CROPS ---
    {
        id: 'sugarcane_1',
        name: 'Sugarcane (Adsali)',
        durationDays: 365,
        waterConsumptionMm: 2200,
        minTemp: 15,
        maxTemp: 40,
        baseYieldTons: 45,
        baseMarketPrice: 2900,
        inputCost: 50000,
        soilTypes: ['Black', 'Loamy', 'Clay'],
        zones: ['Western Maharashtra', 'Marathwada'],
        isLegume: false
    },
    {
        id: 'cotton_bt',
        name: 'Bt Cotton',
        durationDays: 160,
        waterConsumptionMm: 700,
        minTemp: 20,
        maxTemp: 42,
        baseYieldTons: 1.0,
        baseMarketPrice: 62000,
        inputCost: 28000,
        soilTypes: ['Black', 'Medium'],
        zones: ['Vidarbha', 'Marathwada', 'Northern Maharashtra', 'Western Maharashtra'], // Added Western Maharashtra for demo
        isLegume: false
    },
    {
        id: 'wheat_lokwan',
        name: 'Wheat (Lokwan)',
        durationDays: 120,
        waterConsumptionMm: 450,
        minTemp: 10,
        maxTemp: 35,
        baseYieldTons: 1.8,
        baseMarketPrice: 24000,
        inputCost: 18000,
        soilTypes: ['Black', 'Alluvial', 'Loamy', 'Sandy Loam'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'gram_chana',
        name: 'Gram (Chana)',
        durationDays: 110,
        waterConsumptionMm: 300,
        minTemp: 15,
        maxTemp: 35,
        baseYieldTons: 0.8,
        baseMarketPrice: 52000,
        inputCost: 15000,
        soilTypes: ['Black', 'Loamy', 'Sandy Loam'],
        zones: ['General'],
        isLegume: true
    },
    {
        id: 'soybean_js335',
        name: 'Soybean (JS-335)',
        durationDays: 100,
        waterConsumptionMm: 450,
        minTemp: 20,
        maxTemp: 35,
        baseYieldTons: 1.0,
        baseMarketPrice: 48000, // Adjusted to INR/Ton (was 4800/Quintal)
        inputCost: 12000,
        soilTypes: ['Black', 'Medium', 'Loamy'],
        zones: ['General'],
        isLegume: true
    },
    {
        id: 'onion_red',
        name: 'Red Onion',
        durationDays: 120,
        waterConsumptionMm: 500,
        minTemp: 15,
        maxTemp: 35,
        baseYieldTons: 12,
        baseMarketPrice: 18000, // Adjusted to INR/Ton (was 1800/Quintal)
        inputCost: 40000,
        soilTypes: ['Medium', 'Loamy', 'Silt'],
        zones: ['General'],
        isLegume: false
    },
    {
        id: 'tomato_hybrid',
        name: 'Tomato (Hybrid)',
        durationDays: 140,
        waterConsumptionMm: 600,
        minTemp: 15,
        maxTemp: 35,
        baseYieldTons: 25,
        baseMarketPrice: 15000,
        inputCost: 60000,
        soilTypes: ['Medium', 'Loamy', 'Black'],
        zones: ['General'],
        isLegume: false
    }
];

export class HydroEconomicEngine {

    // --- Core Logic ---

    private getWaterBucketSize(soilType: string, depthCm: number = 100): number {
        const type = soilType.toLowerCase();
        let awcPerMeter = 140; // Default Medium

        if (type.includes('sand')) awcPerMeter = 100;
        else if (type.includes('clay') || type.includes('black')) awcPerMeter = 200;
        else if (type.includes('loam')) awcPerMeter = 180;

        return (awcPerMeter * depthCm) / 100;
    }

    private getZoneFromPincode(pincode: string): string {
        const prefix = parseInt(pincode.substring(0, 3));
        if (prefix >= 440 && prefix <= 445) return 'Vidarbha';
        if (prefix >= 431 && prefix <= 436) return 'Marathwada';
        if (prefix >= 410 && prefix <= 416) return 'Western Maharashtra';
        if (prefix >= 424 && prefix <= 425) return 'Northern Maharashtra';
        return 'General';
    }

    private checkClimateStress(crop: CropConfig, lat: number): boolean {
        return true;
    }

    private findCropIdByName(name: string): string | undefined {
        if (!name) return undefined;
        const needle = name.toLowerCase();
        const found = CROP_DATABASE.find(c => c.name.toLowerCase().includes(needle) || c.id === needle);
        return found?.id;
    }

    private calculateSoilLegacyBonus(crop: CropConfig, prevCropId?: string): number {
        if (!prevCropId) return 1.0;
        const prevCrop = CROP_DATABASE.find(c => c.id === prevCropId);
        if (prevCrop?.isLegume && !crop.isLegume) return 1.15;
        if (prevCropId === crop.id) return 0.85;
        return 1.0;
    }

    // --- GOLD-TIER LOGIC ---

    private async calculateEnhancedProfitMetrics(
        crop: CropConfig,
        context: {
            marketPrice: number;
            adjustedYield: number;
            waterCost: WaterCostBreakdown;
        }
    ): Promise<{
        profitIndex: number;
        netProfit: number;
        totalCost: number;
        revenue: number;
    }> {
        const revenue = context.adjustedYield * context.marketPrice;
        const totalCost = crop.inputCost + context.waterCost.totalCostSeason;
        const netProfit = revenue - totalCost;

        // DEBUG LOGGING
        const fs = require('fs');
        const path = require('path');
        const logPath = path.join(__dirname, '../../server_debug.log');
        const logMsg = `[ProfitCalc] ${crop.name}: Yield=${context.adjustedYield}T, Price=${context.marketPrice}, Rev=${Math.round(revenue)}, Cost=${Math.round(totalCost)} (Input=${crop.inputCost} + Water=${context.waterCost.totalCostSeason}), Net=${Math.round(netProfit)}\n`;
        try { fs.appendFileSync(logPath, logMsg); } catch (e) { }

        const profitPerMm = crop.waterConsumptionMm > 0 ? netProfit / crop.waterConsumptionMm : 0;
        const timeFactor = 365 / crop.durationDays;
        const profitIndex = profitPerMm * timeFactor;

        return {
            profitIndex: Math.round(profitIndex),
            netProfit: Math.round(netProfit),
            totalCost: Math.round(totalCost),
            revenue: Math.round(revenue)
        };
    }

    private async getDistrictFromPincode(pincode: string): Promise<string> {
        try {
            const blockInfo = await LocationService.getDistrictFromPincode(pincode);
            // MarketPriceService works best with State names for the API
            return blockInfo?.state || 'Uttar Pradesh';
        } catch {
            return 'Uttar Pradesh';
        }
    }

    private calculateEnhancedImpact(
        intentId: string,
        recommendedCrop: CropConfig,
        areaAcres: number,
        metrics: {
            intentMetrics: any;
            intentRisk: RiskAssessment;
            recommendedMetrics: any;
            recommendedRisk: RiskAssessment;
            waterCostSaved: number;
        }
    ) {
        const intentCrop = CROP_DATABASE.find(c => c.id === intentId);
        if (!intentCrop) return undefined;

        const diffMm = intentCrop.waterConsumptionMm - recommendedCrop.waterConsumptionMm;
        const effectiveAcres = areaAcres > 0 ? areaAcres : 1;
        const totalLitersSaved = diffMm * 4046.86 * effectiveAcres;

        if (totalLitersSaved <= 0) return undefined;

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

    public async getRecommendations(
        ctx: FarmContext,
        userIntentName?: string
    ): Promise<RecommendationResult[]> {

        console.log(`🔍 [HydroEconomic] Starting enhanced recommendations for ${ctx.pincode || 'unknown location'}`);


        const log = (msg: string) => {
            try {
                fs.appendFileSync(path.join(__dirname, '../../server_debug.log'), `[HydroEngine] ${new Date().toISOString()} ${msg}\n`);
            } catch (e) { /* ignore */ }
        };

        log('STEP 1: Fetching Market Prices');
        // STEP 1: Fetch live market prices
        const district = ctx.pincode ? await this.getDistrictFromPincode(ctx.pincode) : 'Prayagraj';
        const cropIds = CROP_DATABASE.map(c => c.id);

        let marketPrices: CropPriceMap;
        let dataQuality = 50;

        try {
            log('Calling MarketPriceService.getAllCropPrices');
            marketPrices = await MarketPriceService.getAllCropPrices(district, cropIds);
            log('MarketPriceService returned');
            dataQuality = 90;
        } catch (error) {
            log(`MARKET FAILURE: ${error}`);
            marketPrices = {};
            CROP_DATABASE.forEach(crop => {
                marketPrices[crop.id] = {
                    currentPrice: crop.baseMarketPrice, // DB is now normalized to INR/Ton
                    msp: MarketPriceService.getMSP(crop.id),
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
                const gwLevel = await CGWBService.getGroundwaterLevel(ctx.lat, ctx.lon);
                waterTableDepth = typeof gwLevel === 'number' ? gwLevel : 20;
            } catch (error) {
                log(`CGWB FAILURE: ${error}`);
            }
        }

        log('STEP 3: Block Classification');
        // STEP 3: Get CGWB block classification
        let blockClassification = 'Unknown';
        if (ctx.district && ctx.block) {
            try {
                const cgwbStatus = await CGWBService.getBlockWaterStatus(ctx.district, ctx.block);
                blockClassification = cgwbStatus.classification;
            } catch (error) {
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

        let intentContext: any = null;
        if (intentCropId) {
            const iCrop = CROP_DATABASE.find(c => c.id === intentCropId);
            if (iCrop) {
                const iPriceData = marketPrices[intentCropId];
                const iPrice = iPriceData?.currentPrice || iCrop.baseMarketPrice;

                const iYieldAdj = YieldAdjustmentService.adjustYieldForWaterStress(
                    iCrop.baseYieldTons, iCrop.waterConsumptionMm, waterAvailable,
                    YieldAdjustmentService.getCropCategory(iCrop.id)
                );

                const iWaterCost = WaterCostCalculator.calculateWaterCost(
                    iCrop.waterConsumptionMm, 1, 'ELECTRIC', waterTableDepth // per-acre
                );

                const iProfit = await this.calculateEnhancedProfitMetrics(iCrop, {
                    marketPrice: iPriceData?.msp ? Math.max(iPrice, iPriceData.msp) : iPrice,
                    adjustedYield: iYieldAdj.adjustedYield,
                    waterCost: iWaterCost
                });

                const iRisk = CropRiskAssessment.assessRisk(iCrop, {
                    blockClassification, waterAvailability: waterAvailable, soilType: ctx.soilType,
                    marketTrend: iPriceData?.trend || 'STABLE', marketVolatility: 10, waterTableDepth, previousCropId: prevCropId
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
        const results: RecommendationResult[] = [];

        for (const crop of CROP_DATABASE) {
            const isZoneMatch = crop.zones.length === 0 || crop.zones.includes(zone) || crop.zones.includes('General') || zone === 'General';
            if (!isZoneMatch) continue;
            if (!this.checkClimateStress(crop, ctx.lat)) continue;
            if (!crop.soilTypes.includes(ctx.soilType)) continue;

            // 1. GET PRICE
            const priceData = marketPrices[crop.id];
            const marketPrice = priceData?.currentPrice || crop.baseMarketPrice;
            const msp = priceData?.msp || null;
            const priceTrend = priceData?.trend || 'STABLE';
            const finalPrice = msp ? Math.max(marketPrice, msp) : marketPrice;

            // 2. ADJUST YIELD
            const cropCategory = YieldAdjustmentService.getCropCategory(crop.id);
            const yieldAdjustment = YieldAdjustmentService.adjustYieldForWaterStress(
                crop.baseYieldTons,
                crop.waterConsumptionMm,
                waterAvailable,
                cropCategory
            );

            // 3. CALCULATE WATER COST (per acre, for comparable profit index)
            const waterCost = WaterCostCalculator.calculateWaterCost(
                crop.waterConsumptionMm,
                1, // Calculate per-acre cost for profitability comparison
                'ELECTRIC',
                waterTableDepth
            );

            // 4. CALCULATE TRUE PROFIT
            const profitMetrics = await this.calculateEnhancedProfitMetrics(crop, {
                marketPrice: finalPrice,
                adjustedYield: yieldAdjustment.adjustedYield,
                waterCost: waterCost
            });

            // 5. RISK ASSESSMENT
            const riskAssessment = CropRiskAssessment.assessRisk(crop, {
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
            const reasons: string[] = [];

            if (intentContext && crop.id !== intentCropId) {
                const userCrop = intentContext.crop;
                const savingsMm = userCrop.waterConsumptionMm - crop.waterConsumptionMm;
                waterSavings = (savingsMm / userCrop.waterConsumptionMm) * 100;

                if (waterSavings > 20 && (
                    profitMetrics.profitIndex >= intentContext.metrics.profitIndex * 0.8 ||
                    riskAssessment.riskScore < intentContext.risk.riskScore - 20
                )) {
                    isSmartSwap = true;
                    reasons.push(`💧 Saves ${Math.round(waterSavings)}% water`);

                    if (profitMetrics.profitIndex > intentContext.metrics.profitIndex) {
                        let profitGain = 0;
                        if (intentContext.metrics.profitIndex <= 0) {
                            // If base crop is making a loss, profit gain is conceptually infinite/massive
                            reasons.push(`💰 Turns loss into profit`);
                        } else {
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
            if (priceTrend === 'UP') reasons.push(`📈 Prices rising - good timing`);

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
                    this.calculateEnhancedImpact(intentCropId!, crop, ctx.totalLandArea, {
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
            if (a.isSmartSwap && !b.isSmartSwap) return -1;
            if (!a.isSmartSwap && b.isSmartSwap) return 1;
            if (Math.abs(a.profitIndex - b.profitIndex) > 10) return b.profitIndex - a.profitIndex;
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
    }
}
