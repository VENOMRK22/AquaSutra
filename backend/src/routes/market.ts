import express from 'express';
import { MarketPriceService } from '../services/MarketPriceService';

const router = express.Router();

// GET /api/market/snapshot - Get categorized market data
router.get('/snapshot', async (req, res) => {
    try {
        const { state = 'Uttar Pradesh' } = req.query;

        // Debug
        console.log(`[API] Fetching market snapshot for state: ${state}`);

        const snapshot = await MarketPriceService.getMarketSnapshot(state as string);

        res.json({
            success: true,
            data: snapshot
        });

    } catch (error) {
        console.error('Market Snapshot Error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch market data'
        });
    }
});

// GET /api/market/search?q=wheat
router.get('/search', async (req, res) => {
    try {
        const { q, state = 'Uttar Pradesh' } = req.query;

        if (!q) {
            return res.status(400).json({
                success: false,
                error: 'Query parameter "q" is required'
            });
        }

        const results = await MarketPriceService.searchCrops(
            q as string,
            state as string
        );

        res.json({
            success: true,
            query: q,
            count: results.length,
            data: results
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Search failed'
        });
    }
});

// GET /api/market/ticker - Live ticker for top 5 crops
router.get('/ticker', async (req, res) => {
    try {
        const { state = 'Uttar Pradesh' } = req.query;

        const ticker = await MarketPriceService.getLiveTicker(state as string);

        res.json({
            success: true,
            data: ticker
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Ticker fetch failed'
        });
    }
});

// GET /api/market/crop/:name - Get specific crop details
router.get('/crop/:name', async (req, res) => {
    try {
        const { name } = req.params;
        const { state = 'Uttar Pradesh' } = req.query;

        const crop = await MarketPriceService.getCropPrice(name, state as string);

        if (!crop) {
            return res.status(404).json({
                success: false,
                error: `Crop "${name}" not found`
            });
        }

        res.json({
            success: true,
            data: crop
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to fetch crop details'
        });
    }
});

export default router;
