import React from "react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell
} from 'recharts';
import StatCard from "./StatCard";
import {
    CurrencyDollarIcon, ShoppingBagIcon, UsersIcon, ArchiveBoxIcon
} from "@heroicons/react/24/outline";

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const DashboardOverview = ({ stats, chartData, categoryData, topProducts }) => {
    return (
        <div className="space-y-10">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    icon={CurrencyDollarIcon} label="Revenue"
                    value={`$${Number(stats?.lifetime_sales || 0).toFixed(2)}`}
                    colorClass="text-indigo-600" bgColorClass="bg-indigo-50"
                />
                <StatCard
                    icon={ShoppingBagIcon} label="Orders"
                    value={stats?.total_orders || 0}
                    colorClass="text-emerald-600" bgColorClass="bg-emerald-50"
                />
                <StatCard
                    icon={UsersIcon} label="Customers"
                    value={stats?.total_customers || 0}
                    colorClass="text-blue-600" bgColorClass="bg-blue-50"
                />
                <StatCard
                    icon={ArchiveBoxIcon} label="Low Stock"
                    value={`${stats?.low_stock_count || 0} items`}
                    colorClass="text-rose-600" bgColorClass="bg-rose-50"
                />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-widest">Revenue Trends</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 700, fill: '#9ca3af' }} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                                <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100">
                    <h3 className="text-lg font-black text-gray-900 mb-6 uppercase tracking-widest">Category Distribution</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={100}
                                    paddingAngle={5} dataKey="sales" nameKey="category"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Top Products Section */}
            <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-8 border-b border-gray-50">
                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest">Top Selling Products</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Product</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Units Sold</th>
                                <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Revenue</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {topProducts.map((p, i) => (
                                <tr key={i} className="hover:bg-gray-50/50">
                                    <td className="px-8 py-4 flex items-center gap-4">
                                        <img src={p.thumbnail} alt="" className="w-10 h-10 rounded-lg object-contain bg-gray-50" />
                                        <span className="font-bold text-gray-900">{p.title}</span>
                                    </td>
                                    <td className="px-8 py-4 font-black text-gray-600">{p.total_sold} units</td>
                                    <td className="px-8 py-4 font-black text-emerald-600">${Number(p.revenue).toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DashboardOverview;
