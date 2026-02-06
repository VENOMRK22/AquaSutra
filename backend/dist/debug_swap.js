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
Object.defineProperty(exports, "__esModule", { value: true });
const HydroEconomicEngine_1 = require("./services/HydroEconomicEngine");
const engine = new HydroEconomicEngine_1.HydroEconomicEngine();
const context = {
    pincode: '412001', // Western Maharashtra (Sugarcane Zone)
    lat: 18.5,
    lon: 73.8,
    soilType: 'Black',
    totalLandArea: 2, // 2 Acres
    previousCropId: 'Soybean', // Just random
};
const userIntent = 'Sugarcane';
(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log(`\n--- DEBUGGING SMART SWAP FOR: ${userIntent} ---`);
    const results = yield engine.getRecommendations(context, userIntent);
    const topResult = results[0];
    console.log('Top Recommendation:', topResult.name);
    console.log('Is Smart Swap:', topResult.isSmartSwap);
    console.log('Impact Object:', JSON.stringify(topResult.impact, null, 2));
    if (!topResult.isSmartSwap) {
        console.log('\nWhy not Smart Swap?');
        // ... logic trace manually if needed ...
    }
}))();
