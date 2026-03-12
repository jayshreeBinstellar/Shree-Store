import React from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from "recharts";

import PrimeDataTable from "../common/PrimeDataTable";
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

    /* ---------------- FORMAT DATA ---------------- */

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


    return (
        <div className="space-y-8 animate-fade-in-up">

            {/* ---------------- QUICK STATS ---------------- */}

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


            {/* ---------------- CHARTS ---------------- */}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* ORDERS vs REVENUE GRAPH */}

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

                                <CartesianGrid strokeDasharray="4 4" vertical={false} />

                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <YAxis
                                    yAxisId="left"
                                    axisLine={false}
                                    tickLine={false}
                                    tickFormatter={(value) => `$${value}`}
                                />

                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    axisLine={false}
                                    tickLine={false}
                                />

                                <Tooltip />

                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#4f46e5"
                                    strokeWidth={3}
                                    name="Revenue"
                                    dot={{ r: 4 }}
                                />

                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    name="Orders"
                                    dot={{ r: 4 }}
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
                                    innerRadius={70}
                                    outerRadius={110}
                                    paddingAngle={6}
                                >

                                    {formattedCategoryData.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={COLORS[index % COLORS.length]}
                                        />
                                    ))}

                                </Pie>

                                <Tooltip />

                                <Legend 
                                    verticalAlign="bottom" 
                                    height={36}
                                    formatter={(value, entry) => (
                                        <span style={{ color: '#374151', fontWeight: 500 }}>
                                            {value}
                                        </span>
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

                    <PrimeDataTable
                        value={topProducts || []}
                        rows={5}
                        columns={[
                            {
                                header: "Product",
                                body: (p) => (
                                    <div className="flex items-center gap-4">

                                        <img
                                            src={p.thumbnail}
                                            alt=""
                                            className="w-12 h-12 object-contain"
                                        />

                                        <span className="font-semibold">
                                            {p.title}
                                        </span>

                                    </div>
                                ),
                                sortable: true
                            },
                            {
                                field: "total_sold",
                                header: "Units Sold",
                                body: (p) => (
                                    <span>
                                        {Number(p.total_sold).toLocaleString()} units
                                    </span>
                                ),
                                sortable: true
                            },
                            {
                                field: "revenue",
                                header: "Revenue",
                                body: (p) => (
                                    <span className="font-semibold">
                                        ${Number(p.revenue).toLocaleString(undefined, {
                                            minimumFractionDigits: 2,
                                            maximumFractionDigits: 2
                                        })}
                                    </span>
                                ),
                                sortable: true
                            }
                        ]}
                    />

                </div>

            </div>

        </div>
    );
};

export default DashboardOverview;