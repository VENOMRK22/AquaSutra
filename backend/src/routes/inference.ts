import express from 'express';
import { HydroEconomicEngine, FarmContext } from '../services/HydroEconomicEngine';
import { CROP_DATABASE } from '../data/CropDatabase';
import { MarketPriceService } from '../services/MarketPriceService';
import { WaterCostCalculator } from '../services/WaterCostCalculator';

import { AgriAdvisorService, CropAdviceInput } from '../services/AgriAdvisorService';

const router = express.Router();
const engine = new HydroEconomicEngine();

router.post('/crop-advice', async (req, res) => {
    try {
        const input: CropAdviceInput = req.body;
        console.log("Analyzing Crop:", input.cropName);
        const advice = await AgriAdvisorService.generateAdvice(input);
        res.json({ success: true, advice });
    } catch (error) {
        console.error("Advice API Error:", error);
        res.status(500).json({ error: "Failed to generate advice" });
    }
});

router.post('/crop-recommendation', async (req, res) => {
    try {
        const { pincode, lat, lon, soilType, totalLandArea, previousCropId, userIntentCropId } = req.body;

        // Sync version for simplicity
        try {
            const fs = require('fs');
            const path = require('path');
            fs.appendFileSync(path.join(__dirname, '../../server_debug.log'), `[Inference] ${new Date().toISOString()} Request received. Body: ${JSON.stringify(req.body)}\n`);
        } catch (e) { console.error("Log failed", e); }

        console.log("--- INFERENCE REQUEST ---");
        console.log("Body:", JSON.stringify(req.body, null, 2));

        if (!pincode || !lat || !lon) {
            res.status(400).json({ error: 'Missing required location data' });
            return; // Explicit return to stop execution
        }

        const context: FarmContext = {
            pincode,
            lat,
            lon,
            soilType: soilType || 'Medium', // Default if unknown
            totalLandArea: totalLandArea || 1,
            previousCropId
        };

        const recommendations = await engine.getRecommendations(context, userIntentCropId);

        res.json({
            success: true,
            recommendations
        });
    } catch (error) {
        console.error("Engine Error:", error);
        res.status(500).json({ error: 'Failed to run Hydro-Economic Engine' });
    }
});



// --- NEW ENDPOINTS (GOLD-TIER) ---

// 1. COMPARE CROPS SIDE-BY-SIDE

// Explicit interface for type safety
interface ComparisonItem {
    cropId: string;
    name: string;
    profitPerDrop: number; // ₹/mm
    totalProfit: number; // ₹/Acre
    roi: number; // %
    dailyEarning: number; // ₹/Day
    marketRisk: number; // 0-100 Score

    waterRequired: number;
    waterCostRupees: number;
    adjustedYield: number;
    yieldReduction: number;
    marketPrice: number;
    msp: number | null;
    priceTrend: 'UP' | 'DOWN' | 'STABLE' | null;
    riskLevel: string;
    riskScore: number;
    riskFactors: string[];
    durationDays: number;
    viabilityScore: number;
}

router.post('/compare-crops', async (req, res) => {
    try {
        const { cropIds, farmContext } = req.body;

        if (!Array.isArray(cropIds) || cropIds.length < 2) {
            res.status(400).json({ error: 'Provide at least 2 crop IDs to compare' });
            return;
        }

        if (cropIds.length > 10) {
            res.status(400).json({ error: 'Maximum 10 crops can be compared at once' });
            return;
        }

        // Run full engine for context
        // Ensure farmContext is constructed properly from body if strictly typed
        const context: FarmContext = {
            pincode: farmContext.pincode,
            lat: farmContext.lat,
            lon: farmContext.lon,
            soilType: farmContext.soilType || 'Medium',
            totalLandArea: farmContext.totalLandArea || 1,
            previousCropId: farmContext.previousCropId
        };

        const allRecommendations = await engine.getRecommendations(context, undefined, cropIds);

        // Filter to requested crops
        const comparison = cropIds.map((id: string) => {
            const crop = allRecommendations.find(r => r.cropId === id);
            const cropConfig = CROP_DATABASE.find(c => c.id === id);
            if (!crop || !cropConfig) return null;

            // --- 5 ADVANCED METRICS CALCULATIONS ---

            // 1. Net Profit (₹/Acre)
            const netProfit = crop.debug.netProfit;

            // 2. Profit Per Drop (₹/mm water)
            const profitPerDrop = crop.profitIndex;

            // 3. ROI (%) = (Net Profit / Total Cost) * 100
            const totalCost = crop.debug.totalInputCost || (cropConfig.inputCost + crop.waterCost.totalCostSeason);
            const roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0;

            // 4. Duration Efficiency (₹/Day) = Net Profit / Duration
            const dailyEarning = cropConfig.durationDays > 0 ? netProfit / cropConfig.durationDays : 0;

            // 5. Market Volatility (Risk Score as proxy for now)
            const marketRisk = crop.riskAssessment.riskScore;

            const item: ComparisonItem = {
                cropId: id,
                name: crop.name,
                profitPerDrop: Math.round(profitPerDrop),
                totalProfit: Math.round(netProfit),
                roi: Math.round(roi),
                dailyEarning: Math.round(dailyEarning),
                marketRisk: marketRisk,

                waterRequired: crop.debug.waterCost,
                waterCostRupees: crop.waterCost.totalCostSeason,
                adjustedYield: crop.adjustedYield,
                yieldReduction: crop.yieldReduction,
                marketPrice: crop.marketPrice,
                msp: crop.msp,
                priceTrend: crop.priceTrend,
                riskLevel: crop.riskAssessment.riskLevel,
                riskScore: crop.riskAssessment.riskScore,
                riskFactors: crop.riskAssessment.factors.slice(0, 3).map(f => f.description),
                durationDays: cropConfig.durationDays,
                viabilityScore: crop.viabilityScore
            };
            return item;
        }).filter((item): item is ComparisonItem => item !== null);

        if (comparison.length === 0) {
            res.status(404).json({ error: 'None of the specified crops are viable for this location' });
            return;
        }

        // Sort by Total Profit by default for clear ranking
        comparison.sort((a, b) => b.totalProfit - a.totalProfit);

        // Generate chart data for frontend (Expanded)
        const chartData = {
            labels: comparison.map(c => c.name),
            profitPerDrop: comparison.map(c => c.profitPerDrop),
            totalProfit: comparison.map(c => c.totalProfit),
            roi: comparison.map(c => c.roi),
            dailyEarning: comparison.map(c => c.dailyEarning),
            riskScore: comparison.map(c => c.riskScore),
            waterRequired: comparison.map(c => c.waterRequired)
        };

        // Determine Winners for each Category
        const getWinner = (metric: keyof ComparisonItem, label: string, lowerIsBetter = false) => {
            const sorted = [...comparison].sort((a, b) => {
                const valA = a[metric] as number;
                const valB = b[metric] as number;
                return lowerIsBetter ? valA - valB : valB - valA;
            });
            return sorted[0] ? { name: sorted[0].name, value: sorted[0][metric], label } : null;
        };

        const highlights = {
            profitWinner: getWinner('totalProfit', 'Highest Net Profit'),
            efficiencyWinner: getWinner('profitPerDrop', 'Best Water Efficiency'),
            roiWinner: getWinner('roi', 'Best ROI'),
            fastestEarner: getWinner('dailyEarning', 'Highest Daily Earning'),
            safestBet: getWinner('marketRisk', 'Lowest Risk', true)
        };

        // Calculate general advantage (Profit)
        const winner = comparison[0];
        const runnerUp = comparison.length > 1 ? comparison[1] : null;
        const advantage = (winner && runnerUp && runnerUp.totalProfit > 0)
            ? ((winner.totalProfit / runnerUp.totalProfit - 1) * 100)
            : 0;

        res.json({
            success: true,
            comparison,
            chartData,
            highlights,
            winner: winner ? {
                crop: winner,
                advantage: runnerUp ? `${advantage.toFixed(0)}% higher profit than ${runnerUp.name}` : 'Uncontested winner',
                message: `${winner.name} is the best overall choice for your farm conditions.`
            } : null,
            metadata: {
                location: farmContext.pincode || `${farmContext.lat}, ${farmContext.lon}`,
                comparedAt: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('Comparison failed:', error);
        res.status(500).json({ error: 'Comparison failed', details: (error as Error).message });
    }
});

// 2. LIVE MARKET PRICES
router.get('/market-prices', async (req, res) => {
    try {
        const { district, cropIds } = req.query;

        if (!district) {
            res.status(400).json({ error: 'District parameter required' });
            return;
        }

        const crops = cropIds ? (cropIds as string).split(',') : CROP_DATABASE.map(c => c.id);

        const prices = await MarketPriceService.getAllCropPrices(
            district as string,
            crops
        );

        // Format for frontend
        const formatted = Object.entries(prices).map(([cropId, data]) => {
            const crop = CROP_DATABASE.find(c => c.id === cropId);
            return {
                cropId,
                cropName: crop?.name || cropId,
                currentPrice: data.currentPrice,
                msp: data.msp,
                trend: data.trend,
                lastUpdated: data.lastUpdated,
                priceChange: data.trend === 'UP' ? '+5-10%' :
                    data.trend === 'DOWN' ? '-5-10%' : '0%'
            };
        });

        res.json({
            success: true,
            district: district,
            prices: formatted,
            disclaimer: 'Prices are indicative. Check local mandi for exact rates.'
        });

    } catch (error) {
        console.error('Market Prices API Error:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
});

// 3. WATER EXTRACTION COST CALCULATOR
router.post('/water-cost', async (req, res) => {
    try {
        const {
            waterRequirementMm,
            areaAcres = 1,
            pumpType = 'ELECTRIC',
            waterTableDepthM = 20
        } = req.body;

        if (!waterRequirementMm) {
            res.status(400).json({ error: 'waterRequirementMm is required' });
            return;
        }

        const cost = WaterCostCalculator.calculateWaterCost(
            parseFloat(waterRequirementMm),
            parseFloat(areaAcres),
            pumpType as any,
            parseFloat(waterTableDepthM)
        );

        // Compare with other pump types
        const comparison = WaterCostCalculator.comparePumpTypes(
            parseFloat(waterRequirementMm),
            parseFloat(waterTableDepthM),
            parseFloat(areaAcres)
        );

        res.json({
            success: true,
            selected: {
                pumpType,
                ...cost
            },
            comparison,
            recommendation: comparison.SOLAR.totalCostSeason < comparison.ELECTRIC.totalCostSeason * 0.6 ?
                'Consider solar pump for 40% cost savings' :
                'Electric pump is most economical'
        });

    } catch (error) {
        res.status(500).json({ error: 'Cost calculation failed' });
    }
});

export default router;
