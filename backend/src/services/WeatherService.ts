import axios from 'axios';

interface WeatherCondition {
    rainPast48h: number;
    soilTemp: number;
    forecastRainNext24h: number;
    isRainEvent: boolean;
    isRainForecasted: boolean;
    isTempIdeal: boolean;
}

export class WeatherService {
    private static BASE_URL = 'https://api.open-meteo.com/v1/forecast';

    /**
     * Checks if local weather meets 'Sowing Trigger' conditions
     * Trigger 1: Rain > 5mm in last 48h (Wet Soil)
     * Trigger 2: Soil Temp 20-30°C (Ideal Germination)
     */
    static async getSowingConditions(lat: number, lon: number): Promise<WeatherCondition> {
        try {
            // Fetch: Past 2 days (for accumulated rain) + Current Soil Temp
            const url = `${this.BASE_URL}?latitude=${lat}&longitude=${lon}&daily=precipitation_sum,soil_temperature_0cm_mean&past_days=2&forecast_days=1&timezone=auto`;

            const response = await axios.get(url);
            const data = response.data;

            // Parse Daily Data
            const daily = data.daily;

            // 1. Rain Logic: Sum of yesterday + today (so far)
            // Note: OpenMeteo returns array [past_day_2, past_day_1, today]
            const rainPast = (daily.precipitation_sum[0] || 0) + (daily.precipitation_sum[1] || 0);
            const rainForecast = daily.precipitation_sum[2] || 0;

            // 2. Temp Logic: Mean soil temp for today
            const soilTemp = daily.soil_temperature_0cm_mean[2] || 25; // Default 25 if missing

            // 3. Triggers
            // "Event" = Actual rain has fallen (Ground is wet)
            const isRainEvent = rainPast > 5;

            // "Forecast" = Rain is coming (Prepare)
            const isRainForecasted = rainForecast > 5;

            const isTempIdeal = soilTemp >= 20 && soilTemp <= 30;

            console.log(`[WeatherService] Lat: ${lat} | RainPast: ${rainPast}mm | RainFut: ${rainForecast}mm | Temp: ${soilTemp}°C`);

            return {
                rainPast48h: rainPast,
                soilTemp: soilTemp,
                forecastRainNext24h: rainForecast,
                isRainEvent,
                isRainForecasted: isRainForecasted, // Export this
                isTempIdeal
            };
        } catch (error: any) {
            console.error('[WeatherService] API Error:', error.response?.data || error.message);
            return {
                rainPast48h: 0,
                soilTemp: 26.5,
                forecastRainNext24h: 0,
                isRainEvent: false,
                isRainForecasted: false,
                isTempIdeal: true
            };
        }
    }
}
