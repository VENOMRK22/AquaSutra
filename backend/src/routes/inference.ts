import express from 'express';
import { HydroEconomicEngine, FarmContext } from '../services/HydroEconomicEngine';

const router = express.Router();
const engine = new HydroEconomicEngine();

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

import { MarketPriceService } from '../services/MarketPriceService';
import { WaterCostCalculator } from '../services/WaterCostCalculator';
// Import CROP_DATABASE from engine (ensure it is exported there now)
import { CROP_DATABASE } from '../services/HydroEconomicEngine';

// --- NEW ENDPOINTS (GOLD-TIER) ---

// 1. COMPARE CROPS SIDE-BY-SIDE
router.post('/compare-crops', async (req, res) => {
    try {
        const { cropIds, farmContext } = req.body;

        if (!Array.isArray(cropIds) || cropIds.length < 2) {
            res.status(400).json({ error: 'Provide at least 2 crop IDs to compare' });
            return;
        }

        if (cropIds.length > 6) {
            res.status(400).json({ error: 'Maximum 6 crops can be compared at once' });
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

        const allRecommendations = await engine.getRecommendations(context);

        // Filter to requested crops
        const comparison = cropIds.map((id: string) => {
            const crop = allRecommendations.find(r => r.cropId === id);
            if (!crop) return null;

            return {
                cropId: id,
                name: crop.name,
                profitPerDrop: crop.profitIndex,
                totalProfit: crop.debug.netProfit,
                waterRequired: crop.debug.waterCost,
                waterCostRupees: crop.waterCost.totalCostSeason,
                adjustedYield: crop.adjustedYield,
                yieldReduction: crop.yieldReduction,
                marketPrice: crop.marketPrice,
                msp: crop.msp,
                priceTrend: crop.priceTrend,
                riskLevel: crop.riskAssessment.riskLevel,
                riskScore: crop.riskAssessment.riskScore,
                riskFactors: crop.riskAssessment.factors.slice(0, 3),
                daysToHarvest: CROP_DATABASE.find(c => c.id === id)?.durationDays,
                viabilityScore: crop.viabilityScore
            };
        }).filter(Boolean);

        if (comparison.length === 0) {
            res.status(404).json({ error: 'None of the specified crops are viable for this location' });
            return;
        }

        // Sort by profit per drop
        comparison.sort((a, b) => (b?.profitPerDrop || 0) - (a?.profitPerDrop || 0));

        // Generate chart data for frontend
        const chartData = {
            labels: comparison.map(c => c?.name),
            profitPerDrop: comparison.map(c => c?.profitPerDrop),
            totalProfit: comparison.map(c => c?.totalProfit),
            waterRequired: comparison.map(c => c?.waterRequired),
            riskScore: comparison.map(c => c?.riskScore),
            viabilityScore: comparison.map(c => c?.viabilityScore)
        };

        // Calculate winner advantage
        const winner = comparison[0];
        const runnerUp = comparison[1];
        const advantage = (winner && runnerUp) ? ((winner.profitPerDrop / runnerUp.profitPerDrop - 1) * 100) : 0;

        res.json({
            success: true,
            comparison,
            chartData,
            winner: winner ? {
                crop: winner,
                advantage: `${advantage.toFixed(0)}% higher profit/drop than runner-up`,
                message: `${winner.name} offers the best water productivity with ${winner.riskLevel.toLowerCase()} risk`
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
