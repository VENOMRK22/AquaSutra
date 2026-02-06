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
const express_1 = __importDefault(require("express"));
const HydroEconomicEngine_1 = require("../services/HydroEconomicEngine");
const CropDatabase_1 = require("../data/CropDatabase");
const MarketPriceService_1 = require("../services/MarketPriceService");
const WaterCostCalculator_1 = require("../services/WaterCostCalculator");
const router = express_1.default.Router();
const engine = new HydroEconomicEngine_1.HydroEconomicEngine();
router.post('/crop-recommendation', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { pincode, lat, lon, soilType, totalLandArea, previousCropId, userIntentCropId } = req.body;
        // Sync version for simplicity
        try {
            const fs = require('fs');
            const path = require('path');
            fs.appendFileSync(path.join(__dirname, '../../server_debug.log'), `[Inference] ${new Date().toISOString()} Request received. Body: ${JSON.stringify(req.body)}\n`);
        }
        catch (e) {
            console.error("Log failed", e);
        }
        console.log("--- INFERENCE REQUEST ---");
        console.log("Body:", JSON.stringify(req.body, null, 2));
        if (!pincode || !lat || !lon) {
            res.status(400).json({ error: 'Missing required location data' });
            return; // Explicit return to stop execution
        }
        const context = {
            pincode,
            lat,
            lon,
            soilType: soilType || 'Medium', // Default if unknown
            totalLandArea: totalLandArea || 1,
            previousCropId
        };
        const recommendations = yield engine.getRecommendations(context, userIntentCropId);
        res.json({
            success: true,
            recommendations
        });
    }
    catch (error) {
        console.error("Engine Error:", error);
        res.status(500).json({ error: 'Failed to run Hydro-Economic Engine' });
    }
}));
router.post('/compare-crops', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
        const context = {
            pincode: farmContext.pincode,
            lat: farmContext.lat,
            lon: farmContext.lon,
            soilType: farmContext.soilType || 'Medium',
            totalLandArea: farmContext.totalLandArea || 1,
            previousCropId: farmContext.previousCropId
        };
        const allRecommendations = yield engine.getRecommendations(context, undefined, cropIds);
        // Filter to requested crops
        const comparison = cropIds.map((id) => {
            const crop = allRecommendations.find(r => r.cropId === id);
            const cropConfig = CropDatabase_1.CROP_DATABASE.find(c => c.id === id);
            if (!crop || !cropConfig)
                return null;
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
            const item = {
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
        }).filter((item) => item !== null);
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
        const getWinner = (metric, label, lowerIsBetter = false) => {
            const sorted = [...comparison].sort((a, b) => {
                const valA = a[metric];
                const valB = b[metric];
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
    }
    catch (error) {
        console.error('Comparison failed:', error);
        res.status(500).json({ error: 'Comparison failed', details: error.message });
    }
}));
// 2. LIVE MARKET PRICES
router.get('/market-prices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { district, cropIds } = req.query;
        if (!district) {
            res.status(400).json({ error: 'District parameter required' });
            return;
        }
        const crops = cropIds ? cropIds.split(',') : CropDatabase_1.CROP_DATABASE.map(c => c.id);
        const prices = yield MarketPriceService_1.MarketPriceService.getAllCropPrices(district, crops);
        // Format for frontend
        const formatted = Object.entries(prices).map(([cropId, data]) => {
            const crop = CropDatabase_1.CROP_DATABASE.find(c => c.id === cropId);
            return {
                cropId,
                cropName: (crop === null || crop === void 0 ? void 0 : crop.name) || cropId,
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
    }
    catch (error) {
        console.error('Market Prices API Error:', error);
        res.status(500).json({ error: 'Failed to fetch prices' });
    }
}));
// 3. WATER EXTRACTION COST CALCULATOR
router.post('/water-cost', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { waterRequirementMm, areaAcres = 1, pumpType = 'ELECTRIC', waterTableDepthM = 20 } = req.body;
        if (!waterRequirementMm) {
            res.status(400).json({ error: 'waterRequirementMm is required' });
            return;
        }
        const cost = WaterCostCalculator_1.WaterCostCalculator.calculateWaterCost(parseFloat(waterRequirementMm), parseFloat(areaAcres), pumpType, parseFloat(waterTableDepthM));
        // Compare with other pump types
        const comparison = WaterCostCalculator_1.WaterCostCalculator.comparePumpTypes(parseFloat(waterRequirementMm), parseFloat(waterTableDepthM), parseFloat(areaAcres));
        res.json({
            success: true,
            selected: Object.assign({ pumpType }, cost),
            comparison,
            recommendation: comparison.SOLAR.totalCostSeason < comparison.ELECTRIC.totalCostSeason * 0.6 ?
                'Consider solar pump for 40% cost savings' :
                'Electric pump is most economical'
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Cost calculation failed' });
    }
}));
exports.default = router;
