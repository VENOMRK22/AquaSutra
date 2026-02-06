"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NASAGRACEService = void 0;
const grace_india_json_1 = __importDefault(require("../data/grace_india.json"));
// Type definition for the imported JSON
const graceData = grace_india_json_1.default;
class NASAGRACEService {
    /**
     * Get Groundwater Anomaly for a specific location and date
     * Checks local JSON database and interpolates between grid points.
     */
    static getGroundwaterAnomaly(lat, lon, date) {
        // 1. Determine Target Month Key
        const targetDate = date || new Date();
        // Use strict YYYY-MM format matching our JSON keys
        const month = (targetDate.getMonth() + 1).toString().padStart(2, '0');
        const key = `${targetDate.getFullYear()}-${month}`;
        // Fallback to last available data if current month is missing
        // (GRACE data usually has 2-3 month latency)
        let dataset = graceData[key];
        let activeKey = key;
        if (!dataset) {
            // Simple fallback: grab the latest key available
            const keys = Object.keys(graceData).sort();
            activeKey = keys[keys.length - 1];
            dataset = graceData[activeKey];
        }
        if (!dataset)
            return null;
        // 2. Interpolate Data from Grid Points
        const anomaly = this.interpolateAnomaly(lat, lon, dataset);
        return {
            anomaly_cm: parseFloat(anomaly.toFixed(2)),
            date: activeKey,
            uncertainty: 2.0 // Standard GRACE uncertainty ~2cm
        };
    }
    /**
     * Calculate Long-term Trend (Slope)
     * Returns cm/year change based on available history
     */
    static getAnomalyTrend(lat, lon, months = 6) {
        const keys = Object.keys(graceData).sort(); // chronological
        // Take last 'months' entries
        const relevantKeys = keys.slice(-months);
        const points = [];
        relevantKeys.forEach((key, index) => {
            const dataset = graceData[key];
            const val = this.interpolateAnomaly(lat, lon, dataset);
            // x = month index, y = anomaly value
            points.push({ x: index, y: val });
        });
        if (points.length < 2)
            return 0;
        // Linear Regression to find slope
        const slope = this.calculateSlope(points);
        // Convert monthly slope to yearly slope (cm/month * 12)
        return parseFloat((slope * 12).toFixed(2));
    }
    /**
     * Bilinear Interpolation to find anomaly at exact Lat/Lon
     * GRACE data is coarse (1 degree grid). We need smooth values in between.
     */
    static interpolateAnomaly(lat, lon, grid) {
        // Find 4 nearest grid points
        // Grid is usually centered on X.5 degrees (24.5, 25.5, etc.)
        // Simple Nearest Neighbor Fallback for now if interpolation complex fails or edge case
        // But let's try to find neighbors within 1 degree
        const neighbors = grid
            .map(p => (Object.assign(Object.assign({}, p), { dist: Math.sqrt(Math.pow(p.lat - lat, 2) + Math.pow(p.lon - lon, 2)) })))
            .sort((a, b) => a.dist - b.dist)
            .slice(0, 4); // Get closest 4
        if (neighbors.length === 0)
            return 0;
        // Weighted Inverse Distance Weighting (IDW) for simplicity over strict Bilinear on irregular set
        // Value = Sum(Val / Dist) / Sum(1 / Dist)
        let numerator = 0;
        let denominator = 0;
        for (const p of neighbors) {
            const weight = 1 / (Math.pow(p.dist, 2) + 0.0001); // Avoid div by zero
            numerator += p.anomaly_cm * weight;
            denominator += weight;
        }
        return numerator / denominator;
    }
    static calculateSlope(points) {
        const n = points.length;
        let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
        for (const p of points) {
            sumX += p.x;
            sumY += p.y;
            sumXY += p.x * p.y;
            sumXX += p.x * p.x;
        }
        const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
        return slope;
    }
}
exports.NASAGRACEService = NASAGRACEService;
