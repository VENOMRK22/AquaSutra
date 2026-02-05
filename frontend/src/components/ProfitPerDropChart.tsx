
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from 'lucide-react';

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
}

interface Props {
    crops: CropRecommendation[];
    userIntent?: string;
}

export function ProfitPerDropChart({ crops, userIntent }: Props) {

    const getRiskColor = (level: string) => {
        switch (level) {
            case 'LOW': return '#10b981';
            case 'MEDIUM': return '#f59e0b';
            case 'HIGH': return '#ef4444';
            case 'EXTREME': return '#991b1b';
            default: return '#6b7280';
        }
    };

    const getRiskBadge = (level: string) => {
        const colors: Record<string, string> = {
            'LOW': 'bg-green-100 text-green-800',
            'MEDIUM': 'bg-yellow-100 text-yellow-800',
            'HIGH': 'bg-red-100 text-red-800',
            'EXTREME': 'bg-red-200 text-red-900'
        };
        return colors[level] || 'bg-gray-100 text-gray-800';
    };

    const topCrops = crops.slice(0, 6); // Show top 6

    return (
        <div className="space-y-8">

            {/* Header */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    💧 Water Productivity Analysis
                </h2>
                <p className="text-gray-600">
                    Comparing crops by profit per mm of water used. Higher is better.
                </p>
                {userIntent && (
                    <div className="mt-3 inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm">
                        <span className="text-gray-600">Your selection:</span>
                        <span className="font-semibold text-blue-600">{userIntent}</span>
                    </div>
                )}
            </div>

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
                                                <p>Water: {data.waterRequired}mm</p>
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

            {/* Detailed Comparison Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="px-6 py-4 bg-gray-50 border-b">
                    <h3 className="text-lg font-semibold">Detailed Comparison</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Crop
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    ₹/mm
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Water (mm)
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Water Cost
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Total Profit
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Yield
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Price
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Risk
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {topCrops.map((crop, index) => (
                                <tr
                                    key={crop.cropId}
                                    className={`${crop.isSmartSwap ? 'bg-green-50 border-l-4 border-green-500' : ''
                                        } ${index === 0 ? 'bg-blue-50' : ''} hover:bg-gray-50 transition-colors`}
                                >
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center gap-2">
                                            {index === 0 && (
                                                <span className="text-xl" title="Top Recommendation">🏆</span>
                                            )}
                                            {crop.isSmartSwap && (
                                                <TrendingUp className="w-4 h-4 text-green-600" />
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-gray-900">
                                                    {crop.name}
                                                </div>
                                                {crop.priceTrend !== 'STABLE' && (
                                                    <div className="flex items-center gap-1 mt-1">
                                                        {crop.priceTrend === 'UP' ? (
                                                            <TrendingUp className="w-3 h-3 text-green-600" />
                                                        ) : (
                                                            <TrendingDown className="w-3 h-3 text-red-600" />
                                                        )}
                                                        <span className={`text-xs ${crop.priceTrend === 'UP' ? 'text-green-600' : 'text-red-600'
                                                            }`}>
                                                            Price {crop.priceTrend.toLowerCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-lg font-bold text-green-600">
                                            ₹{crop.profitPerDrop}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        {crop.waterRequired} mm
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        ₹{crop.waterCostRupees?.toLocaleString() || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="text-sm font-semibold text-gray-900">
                                            ₹{crop.totalProfit.toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm">
                                            <div className="font-medium">{crop.adjustedYield}t</div>
                                            {crop.yieldReduction > 0 && (
                                                <div className="text-xs text-red-600">
                                                    -{crop.yieldReduction.toFixed(0)}% stress
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                        ₹{(crop.marketPrice / 10).toLocaleString()}/q
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRiskBadge(crop.riskLevel)
                                            }`}>
                                            {crop.riskLevel}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Key Insights */}
            <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <h4 className="font-semibold text-green-900">Best Choice</h4>
                    </div>
                    <p className="text-2xl font-bold text-green-700">{topCrops[0]?.name}</p>
                    <p className="text-sm text-green-600 mt-1">
                        ₹{topCrops[0]?.profitPerDrop}/mm water productivity
                    </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                        <h4 className="font-semibold text-blue-900">Highest Profit</h4>
                    </div>
                    <p className="text-2xl font-bold text-blue-700">
                        ₹{Math.max(...topCrops.map(c => c.totalProfit)).toLocaleString()}
                    </p>
                    <p className="text-sm text-blue-600 mt-1">
                        {topCrops.find(c => c.totalProfit === Math.max(...topCrops.map(x => x.totalProfit)))?.name}
                    </p>
                </div>

                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="w-5 h-5 text-purple-600" />
                        <h4 className="font-semibold text-purple-900">Safest Option</h4>
                    </div>
                    <p className="text-2xl font-bold text-purple-700">
                        {topCrops.reduce((min, c) => c.riskScore < min.riskScore ? c : min)?.name}
                    </p>
                    <p className="text-sm text-purple-600 mt-1">
                        {Math.min(...topCrops.map(c => c.riskScore))} risk score
                    </p>
                </div>
            </div>

        </div>
    );
}
