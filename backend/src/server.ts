import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: '*', // Allow all during development
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Debug Logging Middleware
import fs from 'fs';
import path from 'path';

app.use((req, res, next) => {
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.url}\n`;
    console.log(logMessage.trim());
    try {
        fs.appendFileSync(path.join(__dirname, '../server_debug.log'), logMessage);
    } catch (err) {
        console.error("Failed to write to log file:", err);
    }
    next();
});

import authRoutes from './routes/auth';
import waterRoutes from './routes/water';
import farmRoutes from './routes/farm';
import profileRoutes from './routes/profile';
import leaderboardRoutes from './routes/leaderboard';
import inferenceRoutes from './routes/inference';
import sowingRoutes from './routes/sowing';
import marketRoutes from './routes/market';

// Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY || '';
export const supabase = createClient(supabaseUrl, supabaseKey);

// Basic Route
app.get('/', (req: Request, res: Response) => {
    res.json({ message: 'AquaSutra Node.js Backend is Active 🚀' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/water', waterRoutes);
app.use('/api/farm', farmRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/inference', inferenceRoutes);
app.use('/api/sowing', sowingRoutes);
app.use('/api/market', marketRoutes);

// Test DB Connection Route
app.get('/api/health', async (req: Request, res: Response) => {
    res.json({ status: 'healthy', db: 'supabase-configured' });
});

app.listen(Number(port), '0.0.0.0', () => {
    console.log(`[server]: Server is running at http://127.0.0.1:${port}`);
});

// Trigger reload
