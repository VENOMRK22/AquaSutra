
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, CheckCircle, AlertTriangle } from 'lucide-react';

interface CropRecommendation {
    cropId: string;
    name: string;
    profitPerDrop: number; // Renamed from profitIndex to match API
    waterRequired: number;
    totalProfit: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
    riskScore: number;
    isSmartSwap: boolean;
    adjustedYield: number;
    yieldReduction: number;
    marketPrice: number;
    priceTrend: 'UP' | 'DOWN' | 'STABLE';
    waterCostRupees: number;
    roi: number; // New
    dailyEarning: number; // New
    durationDays?: number; // New optional
}

interface Props {
    crops: CropRecommendation[];
    userIntent?: string;
}

export function ProfitPerDropChart({ crops }: Props) {



    const topCrops = crops.slice(0, 10); // Show up to 10

    return (
        <div className="space-y-8">




            {/* Chart 1: Profit Per Drop Bar Chart */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Profit per mm of Water
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={topCrops}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis
                            dataKey="name"
                            angle={-45}
                            textAnchor="end"
                            height={120}
                            style={{ fontSize: '12px' }}
                        />
                        <YAxis
                            label={{ value: '₹ per mm', angle: -90, position: 'insideLeft' }}
                        />
                        <Tooltip
                            content={({ active, payload }) => {
                                if (active && payload && payload[0]) {
                                    const data = payload[0].payload;
                                    return (
                                        <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-lg">
                                            <p className="font-semibold text-gray-900">{data.name}</p>
                                            <p className="text-green-600 font-bold text-xl mt-2">
                                                ₹{data.profitPerDrop}/mm
                                            </p>
                                            <div className="mt-2 text-sm space-y-1">
                                                <p>ROI: <span className="font-bold text-blue-600">{data.roi}%</span></p>
                                                <p>Daily: ₹{data.dailyEarning}/day</p>
                                                <p>Total Profit: ₹{data.totalProfit.toLocaleString()}</p>
                                                <p>Risk: <span className={`font-semibold ${data.riskLevel === 'LOW' ? 'text-green-600' :
                                                    data.riskLevel === 'MEDIUM' ? 'text-yellow-600' : 'text-red-600'
                                                    }`}>{data.riskLevel}</span></p>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            }}
                        />
                        <Bar dataKey="profitPerDrop" radius={[8, 8, 0, 0]}>
                            {topCrops.map((entry, index) => (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={entry.isSmartSwap ? '#10b981' : '#3b82f6'}
                                />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
                <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-green-500 rounded"></div>
                        <span>Smart Swap (Recommended)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 bg-blue-500 rounded"></div>
                        <span>Standard Option</span>
                    </div>
                </div>
            </div>

            {/* Chart 2: Risk vs Profit Scatter */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-yellow-600" />
                    Risk vs Profitability
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={topCrops} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" domain={[0, 100]} />
                        <YAxis
                            dataKey="name"
                            type="category"
                            width={150}
                            style={{ fontSize: '12px' }}
                        />
                        <Tooltip />
                        <Bar dataKey="riskScore" fill="#ef4444" name="Risk Score" />
                    </BarChart>
                </ResponsiveContainer>
                <p className="mt-3 text-sm text-gray-600">
                    Lower risk score = Safer investment. Aim for crops below 50 risk score.
                </p>
            </div>

            {/* 5-Point Analysis (Scrollable Card Deck) */}
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-blue-600" />
                    5-Point Economic Analysis
                </h3>

                {/* Scrollable Container (Hide scrollbar for clean look) */}
                <div className="flex overflow-x-auto pb-8 gap-4 snap-x snap-mandatory px-4 -mx-4 items-stretch" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {topCrops.map((crop, index) => (
                        <div
                            key={crop.cropId}
                            className={`flex-none w-[280px] md:w-[320px] snap-center relative bg-white rounded-2xl transition-all duration-300 transform
                                ${index === 0 ? 'ring-2 ring-blue-500 shadow-xl scale-[1.02] z-10' : 'border border-gray-200 shadow-md hover:shadow-lg opacity-90 hover:opacity-100'}
                                ${crop.isSmartSwap ? 'bg-gradient-to-b from-green-50 to-white' : ''}
                            `}
                        >
                            {/* Card Header */}
                            <div className={`p-5 rounded-t-2xl ${index === 0 ? 'bg-blue-600 text-white' : 'bg-gray-50 text-gray-800'}`}>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="text-xl font-bold truncate">{crop.name}</h4>
                                        <p className={`text-xs ${index === 0 ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {crop.durationDays || 120} days cycle
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md bg-white/20 backdrop-blur-md border border-white/20`}>
                                        {crop.riskLevel} Risk
                                    </span>
                                </div>
                                {index === 0 && (
                                    <div className="mt-2 inline-flex items-center gap-1 bg-white/20 px-2 py-0.5 rounded text-xs font-medium backdrop-blur-sm">
                                        <span>🏆 Top Recommendation</span>
                                    </div>
                                )}
                            </div>

                            {/* Card Body */}
                            <div className="p-5 space-y-5">
                                {/* Metric 1: Profit per Drop */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Water Efficiency</span>
                                        <span className="font-bold text-gray-900">₹{crop.profitPerDrop}/mm</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 rounded-full"
                                            style={{ width: `${Math.min(100, (crop.profitPerDrop / 1000) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Metric 2: Net Profit */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Net Profit / Acre</span>
                                        <span className="font-bold text-gray-900">₹{crop.totalProfit.toLocaleString()}</span>
                                    </div>
                                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-green-500 rounded-full"
                                            style={{ width: `${Math.min(100, (crop.totalProfit / 200000) * 100)}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Metric 3: ROI & Daily Combined */}
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">ROI</div>
                                        <div className={`text-lg font-bold ${crop.roi > 150 ? 'text-green-600' : 'text-gray-800'}`}>
                                            {crop.roi}%
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-lg text-center border border-gray-100">
                                        <div className="text-xs text-gray-500 uppercase tracking-wide">Daily</div>
                                        <div className="text-lg font-bold text-gray-800">₹{crop.dailyEarning}</div>
                                    </div>
                                </div>

                                {/* Metric 4: Stability */}
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-gray-500">Market Stability</span>
                                        <span className="font-bold text-gray-900">{100 - crop.riskScore}%</span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4, 5].map(dot => (
                                            <div
                                                key={dot}
                                                className={`h-1.5 flex-1 rounded-full ${dot <= Math.ceil((100 - crop.riskScore) / 20)
                                                    ? (crop.riskScore < 30 ? 'bg-green-500' : 'bg-yellow-500')
                                                    : 'bg-gray-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    {crop.priceTrend === 'UP' && (
                                        <div className="text-xs text-green-600 mt-2 flex items-center gap-1 font-medium bg-green-50 px-2 py-1 rounded w-fit">
                                            <TrendingUp size={10} /> Market Rising
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>



        </div>
    );
}
