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
const testCases = [
    {
        name: "Western Mah (Pune 411001) - Clay Soil",
        ctx: {
            pincode: '411001',
            lat: 18.52,
            lon: 73.85,
            soilType: 'Clay',
            totalLandArea: 5,
            previousCropId: 'sugarcane_1'
        }
    },
    {
        name: "Vidarbha (Nagpur 440001) - Black Soil",
        ctx: {
            pincode: '440001',
            lat: 21.14,
            lon: 79.08,
            soilType: 'Black',
            totalLandArea: 5,
            previousCropId: 'cotton_bt'
        }
    },
    {
        name: "Unknown Region (111111) - Medium Soil",
        ctx: {
            pincode: '111111',
            lat: 20.0,
            lon: 76.0,
            soilType: 'Medium',
            totalLandArea: 5
        }
    }
];
(() => __awaiter(void 0, void 0, void 0, function* () {
    for (const test of testCases) {
        console.log(`\n--- TEST: ${test.name} ---`);
        try {
            const results = yield engine.getRecommendations(test.ctx);
            results.forEach((r, i) => {
                console.log(`#${i + 1} ${r.name}`);
                console.log(`   PI: ${r.profitIndex}, Score: ${r.viabilityScore}`);
                console.log(`   Debug: bucket=${r.debug.bucketSize}, rev=${r.debug.projectedRevenue}, cost=${r.debug.waterCost}`);
            });
        }
        catch (error) {
            console.error(`Error in test ${test.name}:`, error);
        }
    }
}))();
