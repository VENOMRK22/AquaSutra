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
const waterScore_1 = require("../services/waterScore");
const testCases = [
    { name: '1. Prayagraj (Chaka) - CRITICAL', lat: 25.4358, lon: 81.8463, desc: 'Known Critical Block, Deep Aquifer' },
    { name: '2. Prayagraj (Sahson) - OVER-EXPLOITED', lat: 25.5500, lon: 81.9500, desc: 'Govt Over-exploited status, should trigger override' },
    { name: '3. Pune - SAFE', lat: 18.5204, lon: 73.8567, desc: 'Standard Safe Zone, High Rainfall' },
    { name: '4. Nagpur - MODERATE', lat: 21.1458, lon: 79.0882, desc: 'Central India (Vidarbha), Average conditions' },
    { name: '5. Jaisalmer - DESERT', lat: 26.9157, lon: 70.9083, desc: 'Arid zone, low rainfall, should be Deficit' }
];
function runTest() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("--- STARTING COMPREHENSIVE WATER BALANCE TEST ---\n");
        for (const test of testCases) {
            console.log(`\n🔹 TESTING: ${test.name}`);
            console.log(`   Context: ${test.desc}`);
            try {
                const result = yield (0, waterScore_1.calculateWaterBalance)(test.lat, test.lon);
                console.log(`   > Location Resolved: ${result.villageName}`);
                console.log(`   > Status: ${result.status.toUpperCase()}`);
                console.log(`   > Message: ${result.message}`);
                console.log(`   > Net Balance: ${result.balance_mm} mm`);
                console.log(`   > Days Left: ${Math.round(result.balance_mm / 4)} days`);
                if (result.actualWaterTableDepth) {
                    console.log(`   > Aquifer Depth: ${result.actualWaterTableDepth}m`);
                }
                if (result.cgwbClassification) {
                    console.log(`   > CGWB Class: ${result.cgwbClassification}`);
                }
                if (result.graceAnomaly_cm !== undefined) {
                    console.log(`   > NASA GRACE Anomaly: ${result.graceAnomaly_cm} cm`);
                }
                if (result.satelliteTrend_cm_yr !== undefined) {
                    console.log(`   > Sat Trend: ${result.satelliteTrend_cm_yr} cm/yr`);
                }
            }
            catch (error) {
                console.error(`   ❌ Failed:`, error);
            }
            console.log("-----------------------------------------");
        }
    });
}
runTest();
