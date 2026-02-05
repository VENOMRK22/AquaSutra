import express from 'express';
import { SowingDispatcher } from '../services/SowingDispatcher';

const router = express.Router();

// GET /api/sowing/status
router.get('/status', async (req, res) => {
    try {
        const { userId, lat, lon } = req.query;

        if (!userId || !lat || !lon) {
            res.status(400).json({ error: 'Missing userId, lat, or lon' });
            return;
        }

        const status = await SowingDispatcher.getStatus(
            userId as string,
            parseFloat(lat as string),
            parseFloat(lon as string)
        );

        res.json(status);

    } catch (error) {
        console.error('Sowing Status API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// POST /api/sowing/vote (Ground Truth)
router.post('/vote', async (req, res) => {
    try {
        const { userId, vote } = req.body; // vote: boolean
        await SowingDispatcher.submitVote(userId, vote);
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: 'Vote failed' });
    }
});

export default router;
