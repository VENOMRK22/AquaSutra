import { supabase } from '../server';
import { CROP_BENCHMARKS, SOIL_FACTORS, TECH_FACTORS } from './benchmark';
import { getMarketPrices } from './pricing';
import fs from 'fs';
import path from 'path';

const logDebug = (msg: string) => {
    try { fs.appendFileSync(path.join(__dirname, '../../debug.log'), `[${new Date().toISOString()}] ${msg}\n`); } catch (e) { }
};

export const calculateLeaderboard = async (village?: string, userId?: string) => {
    // 1. Fetch Farms with Crops
    let query = supabase
        .from('farms')
        .select(`
            id, total_area, user_id,
            farm_crops (name, crop_type, soil_type, area)
        `);

    if (userId) {
        query = query.eq('user_id', userId);
    }

    const { data: farms, error: farmError } = await query;

    if (farmError || !farms) {
        console.error("Leaderboard Farm Fetch Error:", farmError);
        return [];
    }
    logDebug(`[Leaderboard] Request(UserId=${userId || 'ALL'}) - Fetched ${farms.length} farms. IDs: ${farms.map(f => f.id).join(',')}`);


    // 2. Fetch Profiles (Map Object for Speed)
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, full_name, village, avatar_url');

    if (profileError) console.error("Profile Fetch Error:", profileError);

    // Create Profile Map
    const profileMap: Record<string, any> = {};
    profiles?.forEach(p => { profileMap[p.id] = p; });

    // 2. Fetch Live Prices
    const livePrices = await getMarketPrices();

    // 3. The Hydro-Economic Engine
    const leaderboard = farms.map((farm: any) => {
        let totalRevenue = 0;
        let totalWater = 0;
        let portfolioDetails: any[] = [];

        if (!farm.farm_crops || farm.farm_crops.length === 0) {
            logDebug(`[Leaderboard] Farm ${farm.id} (User: ${farm.user_id}) SKIPPED: No Crops`);
            return null;
        }

        farm.farm_crops.forEach((crop: any) => {
            // Match Benchmark by Name fuzzy or Crop Type
            // For MVP, we map 'crop_type' (High/Med/Low) is NOT enough.
            // We need the NAME.
            const cropName = crop.name || 'Wheat'; // Fallback

            // Find Benchmark
            let benchmark = CROP_BENCHMARKS['Wheat']; // Default
            for (const key of Object.keys(CROP_BENCHMARKS)) {
                if (cropName.toLowerCase().includes(key.toLowerCase())) {
                    benchmark = CROP_BENCHMARKS[key];
                    break;
                }
            }

            // Find Factors
            const soil = SOIL_FACTORS[crop.soil_type as keyof typeof SOIL_FACTORS] || SOIL_FACTORS['Loamy'];
            // Tech: We don't have 'tech' column yet! Assume Flood (Default)
            // Or randomly assign for demo? No.
            // Let's assume Standard for now.
            const techEff = TECH_FACTORS['Flood'];

            // --- DEEP LOGIC ---

            // 1. Water (Liters)
            // Area * mm * 10,000 (Ha conversion approx, actually 1mm on 1 acre = ~4046 liters)
            // 1 Acre = 4046 sq meters. 1mm = 1 liter/sq meter.
            // So 1mm on 1 Acre = 4046 Liters.
            const waterLiters = crop.area * benchmark.water_need_mm * 4046 * soil.porosity * techEff;

            // 2. Revenue (₹)
            // Yield * Area * Soil Fertility * Price
            const livePriceObj = livePrices[benchmark.name] || { price: 2000 }; // Default fallback
            // livePriceObj.price is per Unit. 
            // If benchmark is Ton, price is per Ton.
            const estimatedYield = benchmark.standard_yield * crop.area * soil.fertility;
            const revenue = estimatedYield * livePriceObj.price;

            totalWater += waterLiters;
            totalRevenue += revenue;

            portfolioDetails.push({
                name: crop.name,
                revenue,
                water: waterLiters,
                priceUsed: livePriceObj.price
            });
        });

        if (totalWater === 0) return null;

        const score = (totalRevenue / totalWater) * 1000; // ₹ per 1000 Liters (kL)

        logDebug(`[Math] User ${farm.user_id} | Rev: ${totalRevenue} | Water: ${totalWater} | Score: ${score}`);

        const profile = profileMap[farm.user_id]; // Lookup

        return {
            user_id: farm.user_id,
            name: profile?.full_name || 'Farmer',
            village: profile?.village || 'Unknown',
            avatar: profile?.avatar_url,
            score: parseFloat(score.toFixed(2)),
            revenue: Math.round(totalRevenue),
            water: Math.round(totalWater),
            crops: portfolioDetails.map(c => c.name).join(', ')
        };
    }).filter((f: any) => {
        if (!f) return false;

        // If searching by UserId, we MUST return the user even if village is missing/unknown
        if (userId && f.user_id === userId) {
            logDebug(`[Filter] Keeping User ${f.user_id} (Matched Query ID)`);
            return true;
        }

        if (!f.village) return false;
        if (f.village === 'Unknown') return false;
        if (village && f.village.toLowerCase() !== village.toLowerCase()) return false;
        return true;
    });

    // Sort DESC
    return leaderboard.sort((a, b) => (b?.score || 0) - (a?.score || 0));
}
