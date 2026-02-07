import express from 'express';
import { supabase } from '../server';
import { WhatsAppService } from '../services/WhatsAppService';

const router = express.Router();

// Normalize activity types to match DB constraint
const normalizeActivityType = (type: string): string => {
    const normalized = type?.toLowerCase() || 'observation';
    if (normalized.includes('fertil')) return 'Fertilizer';
    if (normalized.includes('pest') || normalized.includes('insect')) return 'Pesticide';
    if (normalized.includes('water') || normalized.includes('irrig')) return 'Water';
    if (normalized.includes('harvest')) return 'Harvest';
    return 'Observation';
};

// SAVE Activity Plan
router.post('/save', async (req, res) => {
    try {
        const { cropId, activities, waterSchedule } = req.body;

        console.log("Save Plan Request:", { cropId, activitiesCount: activities?.length });

        if (!cropId || !activities) {
            res.status(400).json({ error: "Missing cropId or activities" });
            return;
        }

        // 1. Insert Scheduled Tasks (Fertilizer/Pesticide) - only tasks within next 7 days
        const today = new Date();
        const maxDate = new Date();
        maxDate.setDate(today.getDate() + 7);

        const tasksToInsert = activities
            .filter((task: any) => {
                const taskDate = new Date(task.date);
                return taskDate >= today && taskDate <= maxDate;
            })
            .map((task: any) => ({
                crop_id: cropId,
                activity_type: normalizeActivityType(task.type),
                title: task.task || 'Scheduled Task',
                description: task.details || '',
                due_date: task.date || new Date().toISOString().split('T')[0],
                status: 'Pending',
                is_ai_generated: true
            }));

        // 2. Generate RECURRING Water Tasks based on frequency
        if (waterSchedule && waterSchedule.frequency) {
            const freqMatch = waterSchedule.frequency.match(/every\s*(\d+)\s*day/i);
            const intervalDays = freqMatch ? parseInt(freqMatch[1]) : 2;

            for (let i = 0; i <= 6; i += intervalDays) {
                const waterDate = new Date();
                waterDate.setDate(today.getDate() + i);

                tasksToInsert.push({
                    crop_id: cropId,
                    activity_type: 'Water',
                    title: `Irrigation: ${waterSchedule.amount || 'Standard'}`,
                    description: `${waterSchedule.frequency || 'Regular'}. Tip: ${waterSchedule.tip || 'Check soil moisture'}`,
                    due_date: waterDate.toISOString().split('T')[0],
                    status: 'Pending',
                    is_ai_generated: true
                });
            }
        }

        console.log("Inserting tasks:", tasksToInsert.length);

        const { data, error } = await supabase
            .from('crop_activities')
            .insert(tasksToInsert)
            .select();

        if (error) {
            console.error("Supabase Insert Error:", error);
            throw error;
        }

        console.log("Saved successfully:", data?.length);

        // --- WHATSAPP NOTIFICATION TRIGGER ---
        try {
            // 1. Fetch Crop & Farm Details to find Owner's Phone
            const { data: cropData } = await supabase
                .from('farm_crops')
                .select(`
                    name,
                    farms (
                        name,
                        user_id
                    )
                `)
                .eq('id', cropId)
                .single();

            if (cropData?.farms) {
                // Handle Supabase joining potential array/object
                const farm = Array.isArray(cropData.farms) ? cropData.farms[0] : cropData.farms;

                if (farm?.user_id) {
                    const userId = farm.user_id;

                    // 2. Fetch User Profile for Phone Number
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('phone_number')
                        .eq('id', userId)
                        .single();

                    if (profile?.phone_number) {
                        // 3. Send WhatsApp
                        const activitySummary = tasksToInsert.map((t: any) => ({
                            title: t.title,
                            date: t.due_date,
                            type: t.activity_type
                        }));

                        WhatsAppService.sendActivityNotification(
                            profile.phone_number,
                            farm.name || 'My Farm',
                            cropData.name,
                            activitySummary
                        ).catch(err => console.error("Background WhatsApp Error:", err));
                    } else {
                        console.log("No phone number found for user, skipping WhatsApp.");
                    }
                }
            }
        } catch (notifyError) {
            console.error("Notification Failed:", notifyError);
            // Don't fail the request, just log it
        }

        res.json({ success: true, count: data?.length || 0 });

    } catch (error: any) {
        console.error("Save Activity Error:", error.message || error);
        res.status(500).json({ error: error.message });
    }
});

// GET Upcoming Activities (NEXT 3 DAYS ONLY)
router.get('/upcoming', async (req, res) => {
    try {
        // Calculate date range: today to 3 days from now
        const today = new Date();
        const threeDaysLater = new Date();
        threeDaysLater.setDate(today.getDate() + 3);

        const todayStr = today.toISOString().split('T')[0];
        const maxDateStr = threeDaysLater.toISOString().split('T')[0];

        const { data, error } = await supabase
            .from('crop_activities')
            .select(`
                *,
                farm_crops (
                    name,
                    farm_id
                )
            `)
            .eq('status', 'Pending')
            .gte('due_date', todayStr)     // >= today
            .lte('due_date', maxDateStr)   // <= 3 days from now
            .order('due_date', { ascending: true })
            .limit(20);

        if (error) throw error;

        res.json({ success: true, activities: data });

    } catch (error: any) {
        console.error("Fetch Activities Error:", error);
        res.status(500).json({ error: error.message });
    }
});

// UPDATE Status
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const { data, error } = await supabase
            .from('crop_activities')
            .update({ status })
            .eq('id', id)
            .select();

        if (error) throw error;
        res.json({ success: true, data });

    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
