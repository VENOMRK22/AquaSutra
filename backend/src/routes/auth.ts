import { Router, Request, Response } from 'express';
import { supabase } from '../server';

const router = Router();

// Register/Login Route (Handled largely by Supabase Client on Frontend, but we sync profile here)
router.post('/sync-profile', async (req: Request, res: Response) => {
    const { id, email, full_name, mobile_number, village, farm_size_acres } = req.body;

    if (!id) {
        return res.status(400).json({ error: 'User ID is required' });
    }

    try {
        const { data, error } = await supabase
            .from('profiles')
            .upsert({
                id,
                full_name,
                mobile_number,
                village,
                farm_size_acres,
                // created_at is auto-handled
            })
            .select()
            .single();

        if (error) throw error;

        res.json({ message: 'Profile synced successfully', profile: data });
    } catch (error: any) {
        console.error('Error syncing profile:', error);
        res.status(500).json({ error: error.message });
    }
});

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;

        res.json(data);
    } catch (error: any) {
        res.status(404).json({ error: 'Profile not found' });
    }
});

export default router;
