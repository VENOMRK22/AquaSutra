import express from 'express';
import { HydroEconomicEngine, FarmContext } from '../services/HydroEconomicEngine';

const router = express.Router();
const engine = new HydroEconomicEngine();

router.post('/crop-recommendation', async (req, res) => {
    try {
        const { pincode, lat, lon, soilType, totalLandArea, previousCropId, userIntentCropId } = req.body;

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

        const recommendations = engine.getRecommendations(context, userIntentCropId);

        res.json({
            success: true,
            recommendations
        });
    } catch (error) {
        console.error("Engine Error:", error);
        res.status(500).json({ error: 'Failed to run Hydro-Economic Engine' });
    }
});

export default router;
