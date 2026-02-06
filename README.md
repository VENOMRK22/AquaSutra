<p align="center">
  <img src="Untitled design.png" alt="AquaSutra Logo" width="180"/>
</p>

<h1 align="center">🌊 AquaSutra</h1>

<p align="center">
  <strong>Smart Water Management & Crop Advisory for Indian Farmers</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript&logoColor=white" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/Supabase-Database-3FCF8E?logo=supabase&logoColor=white" alt="Supabase"/>
  <img src="https://img.shields.io/badge/License-MIT-blue" alt="License"/>
</p>

---

## 📋 Overview

**AquaSutra** is an intelligent water management platform designed to empower Indian farmers with data-driven crop recommendations, water forecasting, and profit optimization. By integrating real-time data from NASA GRACE satellites, CGWB groundwater levels, live market prices, and weather forecasts, AquaSutra helps farmers make smarter decisions about what to grow and when to irrigate.

### 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 💧 **Water Balance Widget** | Real-time tracking of soil water capacity and irrigation needs |
| 🌾 **Hydro-Economic Engine** | AI-powered crop recommendations based on profit per drop of water |
| 📈 **Market Price Integration** | Live mandi (market) prices with MSP comparison and trend analysis |
| 🗓️ **Sowing Dispatcher** | Season-aware proactive alerts for optimal planting windows |
| 🏆 **Water Leaderboard** | Gamified community rankings to encourage water conservation |
| 🌍 **Multi-Language Support** | Localized interface for wider accessibility |
| 📊 **Profit Analysis** | Detailed breakdown of costs, yields, and risk assessments |

---

## 🏗️ Architecture

```
AquaSutra/
├── frontend/                 # React + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # Auth & Language providers
│   │   ├── pages/            # App screens (Dashboard, Farm, etc.)
│   │   ├── lib/              # Supabase client configuration
│   │   └── i18n/             # Internationalization
│   └── ...
├── backend/                  # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── routes/           # API endpoints
│   │   ├── services/         # Core business logic
│   │   │   ├── HydroEconomicEngine.ts    # Crop recommendation engine
│   │   │   ├── CGWBService.ts            # Groundwater data
│   │   │   ├── MarketPriceService.ts     # Live mandi prices
│   │   │   ├── WeatherService.ts         # Weather forecasts
│   │   │   ├── WaterCostCalculator.ts    # Irrigation cost analysis
│   │   │   └── ...
│   │   └── ...
│   └── ...
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18+ 
- **npm** v9+
- **Supabase** account (for database & auth)

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/VENOMRK22/AquaSutra.git
cd AquaSutra
```

### 2️⃣ Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file:

```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
# Add other API keys as needed (weather, market data, etc.)
```

Start the backend:

```bash
npm run dev
```

### 3️⃣ Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
```

Configure your `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_API_URL=http://localhost:3000
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

---

## 📱 Screenshots

| Dashboard | Farm Management | Crop Planning |
|-----------|-----------------|---------------|
| Water score & profit tracking | Manage crops & land | AI-powered recommendations |

---

## 🧠 Core Engine: HydroEconomic Recommendations

The **Hydro-Economic Engine** is the brain of AquaSutra. It calculates a unique **Profit Index** (₹/mm of water) for each crop by considering:

1. **Live Market Prices** - Current mandi rates with MSP fallback
2. **Water Availability** - Soil bucket capacity + expected rainfall
3. **Yield Adjustments** - Water stress impact on crop output
4. **Extraction Costs** - Groundwater depth-based pumping costs
5. **Risk Assessment** - Block water status, market volatility, monocropping penalties

### Smart Swap Detection

When a farmer plans to grow a water-intensive crop, the engine suggests **Smart Swaps** - alternative crops that:
- Save 20%+ water
- Maintain 80%+ of original profit potential
- Have lower risk profiles

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| TailwindCSS 4 | Styling |
| Framer Motion | Animations |
| React Router 7 | Navigation |
| Recharts | Data Visualization |
| Lucide React | Icons |

### Backend
| Technology | Purpose |
|------------|---------|
| Node.js | Runtime |
| Express 5 | API Framework |
| TypeScript | Type Safety |
| Supabase | Database & Auth |
| Axios | HTTP Client |

### Data Sources
| Source | Data Provided |
|--------|---------------|
| NASA GRACE | Satellite groundwater anomaly data |
| CGWB | Block-level water table depths |
| OpenWeather | Rainfall & temperature forecasts |
| Agmarknet | Live mandi commodity prices |

---

## 📂 API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/health` | GET | Server health check |
| `/api/auth/*` | POST | Authentication routes |
| `/api/farm` | GET/POST | Farm CRUD operations |
| `/api/farm/crop` | POST/DELETE | Crop management |
| `/api/water` | GET | Water balance & forecasts |
| `/api/inference/crop-recommendation` | POST | Get crop recommendations |
| `/api/leaderboard` | GET | Water conservation rankings |
| `/api/profile` | GET/PUT | User profile management |
| `/api/sowing` | GET | Seasonal sowing alerts |

---

## 🗄️ Database Schema

The app uses **Supabase** with the following core tables:

- `profiles` - User information with village/location
- `farms` - Farm metadata (area, name)
- `crops` - Crop records per farm
- `water_scores` - Historical water usage tracking
- `leaderboard` - Aggregated conservation scores

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Team

**4Bits** - Building sustainable agri-tech solutions for India

---

## 🙏 Acknowledgments

- [NASA GRACE Mission](https://grace.jpl.nasa.gov/) for groundwater data
- [CGWB India](http://cgwb.gov.in/) for block-level water monitoring
- [Supabase](https://supabase.com/) for backend infrastructure
- The farming communities of Maharashtra for inspiration and feedback

---

<p align="center">
  <strong>💧 Every Drop Counts. Every Farmer Matters. 💧</strong>
</p>
