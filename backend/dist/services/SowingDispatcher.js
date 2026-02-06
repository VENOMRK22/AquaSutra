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
exports.SowingDispatcher = void 0;
const WeatherService_1 = require("./WeatherService");
class SowingDispatcher {
    // Mock user cohort determination
    static getUserCohort(userId) {
        // Mock: Even UserID = URGENT (Light Soil), Odd = STANDARD (Heavy)
        // Check last char of ID
        const lastChar = userId.charCodeAt(userId.length - 1);
        return lastChar % 2 === 0 ? 'URGENT' : 'STANDARD';
    }
    static getStatus(userId, lat, lon) {
        return __awaiter(this, void 0, void 0, function* () {
            // 1. Get Environmental Trigger
            const weather = yield WeatherService_1.WeatherService.getSowingConditions(lat, lon);
            const cohort = this.getUserCohort(userId);
            // 2. State Machine Logic
            // PRIORITY 1: Check Moisture (The Driver)
            if (!weather.isRainEvent) {
                // SUB-CASE: Dry now, but Rain coming?
                if (weather.isRainForecasted) {
                    return {
                        state: 'WAITING',
                        weather: { rain: weather.rainPast48h, temp: weather.soilTemp, isIdeal: weather.isTempIdeal },
                        cohort,
                        message: `Rainbox detected incoming rain (${weather.forecastRainNext24h}mm). Prepare your farm.`
                    };
                }
                return {
                    state: 'WAITING',
                    weather: { rain: weather.rainPast48h, temp: weather.soilTemp, isIdeal: weather.isTempIdeal },
                    cohort,
                    message: `Soil moisture low (${weather.rainPast48h.toFixed(1)}mm). Waiting for rain (>5mm).`
                };
            }
            // PRIORITY 2: Check Temperature (The Gatekeeper)
            // If wet but too hot/cold, we wait (Risk of seed burn or dormancy)
            if (!weather.isTempIdeal) {
                return {
                    state: 'WAITING',
                    weather: { rain: weather.rainPast48h, temp: weather.soilTemp, isIdeal: false },
                    cohort,
                    message: `Soil is wet, but temp (${weather.soilTemp.toFixed(1)}°C) is not ideal for germination.`
                };
            }
            // PRIORITY 3: Conditions Met -> Verify Ground Truth (Poll)
            // For this demo: If we haven't confirmed it yet, go to POLLING
            // In real app: Check `villageVotes` for this village_id
            const isConsensusReached = this.checkConsensus(lat, lon);
            if (!isConsensusReached) {
                return {
                    state: 'POLLING',
                    weather: { rain: weather.rainPast48h, temp: weather.soilTemp, isIdeal: true },
                    cohort,
                    message: `Rain detected (${weather.rainPast48h}mm). Verify topsoil condition.`
                };
            }
            // CASE C: Consensus is "YES" -> DISPATCH!
            // Apply Staggering Logic
            if (cohort === 'URGENT') {
                return {
                    state: 'DISPATCH_URGENT', // Immediate
                    weather: { rain: weather.rainPast48h, temp: weather.soilTemp, isIdeal: true },
                    cohort,
                    message: `Conditions optimal. Light soil dries fast. Act now.`
                };
            }
            else {
                return {
                    state: 'DISPATCH_STANDARD', // Delayed
                    weather: { rain: weather.rainPast48h, temp: weather.soilTemp, isIdeal: true },
                    cohort,
                    message: `Heavy soil needs 24h drainage. Book tractor for tomorrow.`
                };
            }
        });
    }
    // Mock Consensus Logic
    static checkConsensus(lat, lon) {
        // For demo: Always return FALSE initially to force the "Polling" UI state
        // The User will manually switch it to "Polled" in the frontend for now
        // OR we can allow the POST endpoint to update this.
        return false;
    }
    // Called when user votes "YES"
    static submitVote(userId, vote) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`[SowingDispatcher] User ${userId} voted ${vote}`);
            // In real DB, we would save this.
            return { success: true };
        });
    }
}
exports.SowingDispatcher = SowingDispatcher;
// In-memory mock for "Ground Truth" responses (Village Level)
// In real app, this would be in Database: `sowing_votes` table
SowingDispatcher.villageVotes = {};
