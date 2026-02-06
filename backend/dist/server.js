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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
// Middleware
app.use((0, cors_1.default)({
    origin: '*', // Allow all during development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
// Debug Logging Middleware
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
app.use((req, res, next) => {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
    console.log(logMessage.trim());
    try {
        fs_1.default.appendFileSync(path_1.default.join(__dirname, '../server_debug.log'), logMessage);
    }
    catch (err) {
        console.error("Failed to write to log file:", err);
    }
    next();
});
const auth_1 = __importDefault(require("./routes/auth"));
const water_1 = __importDefault(require("./routes/water"));
const farm_1 = __importDefault(require("./routes/farm"));
const profile_1 = __importDefault(require("./routes/profile"));
const leaderboard_1 = __importDefault(require("./routes/leaderboard"));
const inference_1 = __importDefault(require("./routes/inference"));
const sowing_1 = __importDefault(require("./routes/sowing"));
const market_1 = __importDefault(require("./routes/market"));
// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseKey);
// Basic Route
app.get('/', (req, res) => {
    res.json({ message: 'AquaSutra Node.js Backend is Active 🚀' });
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/water', water_1.default);
app.use('/api/farm', farm_1.default);
app.use('/api/profile', profile_1.default);
app.use('/api/leaderboard', leaderboard_1.default);
app.use('/api/inference', inference_1.default);
app.use('/api/sowing', sowing_1.default);
app.use('/api/market', market_1.default);
// Test DB Connection Route
app.get('/api/health', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({ status: 'healthy', db: 'supabase-configured' });
}));
app.listen(Number(port), '0.0.0.0', () => {
    console.log(`[server]: Server is running at http://127.0.0.1:${port}`);
});
// Trigger reload
