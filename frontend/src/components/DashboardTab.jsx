import React, { useMemo } from 'react';
import { 
    BarChart, Bar, Line, ComposedChart, AreaChart, Area, XAxis, YAxis, 
    CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { Activity, AlertTriangle, AlertCircle, Package, Clock } from 'lucide-react';

export default function DashboardTab({ inventory, orders, history, onAutoReplenish }) {
    const expiredCount = inventory.filter(i => i.status === "CRITICAL: EXPIRED").length;
    const nearExpiryCount = inventory.filter(i => i.status === "WARNING: NEAR EXPIRY").length;
    const lowStockCount = inventory.filter(i => i.status === "LOW STOCK").length;
    const healthyCount = inventory.filter(i => i.status === "HEALTHY").length;
    const pendingOrdersCount = orders.filter(o => o.status === "PENDING").length;

    // Data for Graph 1: Top 10 Stock vs Threshold
    const topStockData = useMemo(() => {
        return [...inventory]
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 10)
            .map(item => ({
                name: item.medicine_name,
                stock: item.quantity,
                threshold: item.min_stock_threshold
            }));
    }, [inventory]);

    // Data for Graph 2: Medicines Going Empty (Stock < Threshold, sorted ascending)
    const emptyMedicinesData = useMemo(() => {
        return inventory
            .filter(item => item.quantity <= item.min_stock_threshold)
            .sort((a, b) => (a.quantity / a.min_stock_threshold) - (b.quantity / b.min_stock_threshold))
            .slice(0, 10)
            .map(item => ({
                name: item.medicine_name,
                stock: item.quantity,
                fill: item.quantity < (item.min_stock_threshold * 0.5) ? '#ef4444' : '#f59e0b'
            }));
    }, [inventory]);

    // Data for Graph 3: Pie Chart
    const pieData = [
        { name: 'Healthy', value: healthyCount, color: '#10b981' },
        { name: 'Low Stock', value: lowStockCount, color: '#f59e0b' },
        { name: 'Near Expiry', value: nearExpiryCount, color: '#f97316' },
        { name: 'Expired', value: expiredCount, color: '#ef4444' }
    ].filter(d => d.value > 0);

    // Data for Graph 4: Recent Dispense Volume
    const historyVolumeData = useMemo(() => {
        // Reverse history to show oldest first in the chart (left to right)
        return [...history].reverse().map(h => ({
            name: new Date(h.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
            quantity: h.quantity_dispensed,
            medicine: h.medicine_name
        }));
    }, [history]);

    // Formatter for tooltips
    const customTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 rounded shadow-lg border border-gray-100">
                    <p className="font-bold text-gray-800">{label}</p>
                    {payload.map(p => (
                        <p key={p.dataKey} style={{ color: p.color }}>
                            {p.name}: {p.value}
                        </p>
                    ))}
                    {payload[0].payload.medicine && (
                        <p className="text-gray-500 text-xs">Item: {payload[0].payload.medicine}</p>
                    )}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-6">
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
                        <AlertCircle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Expired Items</p>
                        <p className="text-2xl font-bold text-gray-900">{expiredCount}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                        <AlertTriangle size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Low Stock</p>
                        <p className="text-2xl font-bold text-gray-900">{lowStockCount}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center">
                    <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                        <Package size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Healthy Items</p>
                        <p className="text-2xl font-bold text-gray-900">{healthyCount}</p>
                    </div>
                </div>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-center justify-between">
                    <div className="flex items-center">
                        <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                            <Activity size={24} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                            <p className="text-2xl font-bold text-gray-900">{pendingOrdersCount}</p>
                        </div>
                    </div>
                    <button 
                        onClick={onAutoReplenish}
                        className="p-2 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-100 transition-colors"
                        title="Run Auto-Replenish"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                    </button>
                </div>
            </div>

            {/* Graphs Row 1 */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Top 10 Stock vs Threshold</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <ComposedChart data={topStockData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-30} textAnchor="end" height={60} />
                                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                                <RechartsTooltip content={customTooltip} />
                                <Legend />
                                <Bar dataKey="stock" name="Current Stock" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={20} />
                                <Line type="monotone" dataKey="threshold" name="Min Threshold" stroke="#ef4444" strokeWidth={2} dot={false} />
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Medicines Going Empty</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={emptyMedicinesData} layout="vertical" margin={{ top: 5, right: 30, left: 30, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                                <RechartsTooltip cursor={{fill: '#f3f4f6'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                <Bar dataKey="stock" name="Remaining Stock" radius={[0, 4, 4, 0]} barSize={15}>
                                    {emptyMedicinesData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                        {emptyMedicinesData.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                                No medicines are currently below threshold.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Graphs Row 2 */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Dispense Volume (Area Chart) */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Dispense Volume</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={historyVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorQty" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                <RechartsTooltip content={customTooltip} />
                                <Area type="monotone" dataKey="quantity" name="Qty Dispensed" stroke="#8b5cf6" fillOpacity={1} fill="url(#colorQty)" />
                            </AreaChart>
                        </ResponsiveContainer>
                        {historyVolumeData.length === 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">
                                No recent dispense history available.
                            </div>
                        )}
                    </div>
                </div>

                {/* Inventory Health Pie Chart */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4">Health Distribution</h3>
                    <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3 mt-4">
                        {pieData.map(entry => (
                            <div key={entry.name} className="flex items-center text-xs">
                                <span className="w-2.5 h-2.5 rounded-full mr-1.5" style={{ backgroundColor: entry.color }}></span>
                                <span className="text-gray-600">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Sales Log Widget */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center">
                        <Clock className="w-5 h-5 mr-2 text-indigo-600" />
                        Recent Dispense Activity Log
                    </h3>
                </div>
                <div className="overflow-x-auto max-h-80">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 sticky top-0 z-10">
                            <tr>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Timestamp</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Medicine</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Sold Qty</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Remaining</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {history.map(item => (
                                <tr key={item.id} className={`hover:bg-gray-50 transition-colors ${item.is_critical ? 'bg-red-50/50' : ''}`}>
                                    <td className="px-6 py-3 text-gray-500">
                                        {new Date(item.timestamp).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3 font-medium text-gray-900">{item.medicine_name}</td>
                                    <td className="px-6 py-3 text-right font-mono font-medium text-indigo-600">
                                        -{item.quantity_dispensed}
                                    </td>
                                    <td className="px-6 py-3 text-right font-mono text-gray-600">
                                        {item.remaining_quantity}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        {item.is_critical ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                                Critical Stock
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                Healthy
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {history.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No recent dispense activity found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
