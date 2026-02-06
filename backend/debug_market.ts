
import { MarketPriceService } from './src/services/MarketPriceService';
import { CROP_DATABASE } from './src/data/CropDatabase';

async function test() {
    try {
        console.log("Testing MarketPriceService...");
        console.log(`CROP_DATABASE size: ${CROP_DATABASE.length}`);

        const prices = await MarketPriceService.getAllCropPrices('Ahmednagar', ['sugar_cane', 'cotton_bt']);
        console.log("Prices fetched:", Object.keys(prices).length);
        console.log(JSON.stringify(prices, null, 2));

        const potato = await MarketPriceService.getAllCropPrices('Ahmednagar', ['potato_ag']);
        console.log("Potato price:", potato);

    } catch (e) {
        console.error("Test failed:", e);
    }
}

test();
