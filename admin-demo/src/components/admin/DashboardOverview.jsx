import React from "react";
import {
    LineChart,
    Line,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
    BarChart,
    Bar,
    RadialBarChart,
    RadialBar
} from "recharts";

// import PrimeDataTable from "../common/PrimeDataTable";
import StatCard from "./StatCard";

import {
    CurrencyDollarIcon,
    ShoppingBagIcon,
    UsersIcon,
    ArchiveBoxIcon,
    ArrowTrendingUpIcon,
    ChartPieIcon
} from "@heroicons/react/24/outline";

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444'];

const DashboardOverview = ({ stats, chartData, categoryData, topProducts }) => {


    const formattedChartData = chartData?.map(item => ({
        date: new Date(item.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric"
        }),
        sales: Number(item.total_sales),
        orders: Number(item.total_orders)
    })) || [];

    const formattedCategoryData = categoryData?.map(c => ({
        category: c.category,
        sales: Number(c.sales)
    })) || [];

    // Top products for bar chart (top 8)
    const formattedTopProducts = topProducts?.slice(0, 8).map(p => ({
        name: p.title?.substring(0, 20) + (p.title.length > 20 ? '...' : ''),
        revenue: Number(p.revenue),
        sold: Number(p.total_sold),
        fill: COLORS[(topProducts.indexOf(p) % COLORS.length)]
    })) || [];


    return (
        <div className="space-y-8 animate-fade-in-up">


            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                <StatCard
                    icon={CurrencyDollarIcon}
                    label="Total Revenue"
                    value={`$${Number(stats?.lifetime_sales || 0).toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                    })}`}
                    colorClass="text-indigo-600"
                    bgColorClass="bg-indigo-50/50"
                />

                <StatCard
                    icon={ShoppingBagIcon}
                    label="Total Orders"
                    value={Number(stats?.total_orders || 0).toLocaleString()}
                    colorClass="text-emerald-600"
                    bgColorClass="bg-emerald-50/50"
                />

                <StatCard
                    icon={UsersIcon}
                    label="Customers"
                    value={Number(stats?.total_customers || 0).toLocaleString()}
                    colorClass="text-blue-600"
                    bgColorClass="bg-blue-50/50"
                />

                <StatCard
                    icon={ArchiveBoxIcon}
                    label="Low Stock Items"
                    value={Number(stats?.low_stock_count || 0)}
                    colorClass="text-rose-600"
                    bgColorClass="bg-rose-50/50"
                />

            </div>


       

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">


                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border">

                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-bold flex items-center gap-2">
                            <ArrowTrendingUpIcon className="h-5 w-5 text-indigo-600" />
                            Orders vs Revenue
                        </h3>
                    </div>

                    <div className="h-[320px]">

                        <ResponsiveContainer width="100%" height="100%">

                                <LineChart data={formattedChartData}>

                                <CartesianGrid strokeDasharray="4 4" vertical={false} strokeOpacity={0.5} />

                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                                />

                                <YAxis
                                    yAxisId="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value.toLocaleString()}`}
                                    tick={{ fill: '#6b7280' }}
                                />

                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#6b7280' }}
                                />

                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                    }}
                                    labelStyle={{ fontWeight: '600', color: '#1f2937' }}
                                />

                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4f46e5" stopOpacity={0.8}/>
                                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10b981" stopOpacity={0.8}/>
                                        <stop offset="100%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>

                                <Area 
                                    yAxisId="left" 
                                    type="monotone" 
                                    dataKey="sales" 
                                    stroke="#4f46e5" 
                                    strokeWidth={0}
                                    fillOpacity={1} 
                                    fill="url(#revenueGradient)" 
                                />

                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    name="Revenue"
                                    dot={{ fill: '#4f46e5', strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 8, strokeWidth: 3 }}
                                />

                                <Area 
                                    yAxisId="right" 
                                    type="monotone" 
                                    dataKey="orders" 
                                    stroke="#10b981" 
                                    strokeWidth={0}
                                    fillOpacity={1} 
                                    fill="url(#ordersGradient)" 
                                />

                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    name="Orders"
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 5 }}
                                    activeDot={{ r: 8, strokeWidth: 3 }}
                                />

                            </LineChart>

                        </ResponsiveContainer>

                    </div>

                </div>


                {/* CATEGORY PIE */}

                <div className="bg-white p-8 rounded-2xl shadow-sm border">

                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <ChartPieIcon className="h-5 w-5 text-emerald-600" />
                        Sales Composition
                    </h3>

                    <div className="h-[280px]">

                        <ResponsiveContainer width="100%" height="100%">

                            <PieChart>

                                <Pie
                                    data={formattedCategoryData}
                                    dataKey="sales"
                                    nameKey="category"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataLabels={({ name, percent, value }) => `${name}\n$${value.toLocaleString()}`}
                                >
                                    {formattedCategoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}
                                </Pie>

                                <Tooltip 
                                    contentStyle={{
                                        backgroundColor: 'white',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                                    }}
                                />

                                <Legend 
                                    verticalAlign="middle" 
                                    layout="vertical"
                                    align="right"
                                    iconType="circle"
                                    formatter={(value) => (
                                        <span className="text-sm font-medium text-slate-700">{value}</span>
                                    )}
                                /> 

                            </PieChart>

                        </ResponsiveContainer>

                    </div>

                </div>

            </div>


            {/* ---------------- TOP PRODUCTS ---------------- */}

            <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">

                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold">
                        Top Performing Products
                    </h3>
                </div>

                <div className="p-6">
                    <div className="h-[350px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={formattedTopProducts} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" tickLine={false} axisLine={false} tickFormatter={(value) => `$${value.toLocaleString()}`} />
                                <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} width={150} />
                                <Tooltip formatter={(value) => [`$${value.toLocaleString()}`]} labelFormatter={(label) => `Product: ${label}`} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 4, 4]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>

        </div>
    );
};

export default DashboardOverview;