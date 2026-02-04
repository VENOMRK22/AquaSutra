import { Router } from 'express';
import { calculateLeaderboard } from '../services/leaderboard_v2';

const router = Router();

router.get('/', async (req, res) => {
    try {
        const { village, userId } = req.query;
        console.log(`[API] Leaderboard Request - Village: ${village}, UserId: ${userId}`);

        const rankings = await calculateLeaderboard(village as string, userId as string);
        console.log(`[API] Returned ${rankings.length} rankings`);

        res.json({ success: true, rankings });
    } catch (error: any) {
        console.error("Leaderboard API Error:", error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
