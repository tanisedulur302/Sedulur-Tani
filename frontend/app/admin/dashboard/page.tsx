"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

interface DashboardStats {
  summary: {
    totalRevenue: number;
    averageOrderValue: number;
    totalOrders: number;
    totalUsers: number;
    totalBuyers: number;
    totalSellers: number;
    totalProducts: number;
  };
  ordersByStatus: {
    completed: number;
    pending: number;
    processed: number;
    shipped: number;
    cancelled: number;
  };
  categoryDistribution?: Array<{
    name: string;
    value: number;
    percentage?: string;
  }>;
  topCategories?: Array<{
    id: string;
    name: string;
    productCount: number;
    totalOrders: number;
    totalRevenue: number;
  }>;
  topSellers?: Array<{
    id: string;
    name: string;
    totalSales: number;
    orderCount: number;
    revenue: number;
  }>;
  recentOrders?: Array<{
    id: string;
    buyerName: string;
    productName: string;
    sellerName: string;
    totalAmount: number;
    totalPrice: number;
    status: string;
    createdAt: string;
  }>;
  monthlyRevenue?: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
  dailySales?: Array<{
    day: string;
    revenue: number;
    orders: number;
  }>;
  userGrowth?: Array<{
    day: string;
    buyers: number;
    sellers: number;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "analytics" | "products"
  >("overview");

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Clear previous data to ensure chart re-renders with fresh data
      setStats(null);

      const response = await dashboardApi.getAdminStats();
      setStats(response.data.data);

      // Calculate percentage for category distribution
      if (response.data.data.categoryDistribution) {
        const total = response.data.data.categoryDistribution.reduce(
          (sum: number, cat: { value: number }) => sum + cat.value,
          0,
        );
        response.data.data.categoryDistribution.forEach(
          (cat: { value: number; percentage?: string }) => {
            cat.percentage = ((cat.value / total) * 100).toFixed(1);
          },
        );
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const formatNumber = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toString();
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-white rounded-2xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-white rounded-2xl"></div>
          <div className="h-96 bg-white rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="p-6 space-y-8">
      {/* Header with Tabs */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-bold text-gray-800">
          Dashboard Analytics
        </h1>
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "overview"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "analytics"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("products")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "products"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Products
          </button>
        </div>
      </div>

      {activeTab === "overview" && (
        <>
          {/* Stats Cards with linear */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-linear-to-br from-blue-500 to-blue-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <span className="text-white/80 text-sm bg-white/10 px-2 py-1 rounded-full">
                  +12.5%
                </span>
              </div>
              <p className="text-blue-100 text-sm mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold">
                {formatCurrency(stats.summary.totalRevenue)}
              </h3>
              <p className="text-blue-100 text-xs mt-2">
                Avg: {formatCurrency(stats.summary.averageOrderValue)}
              </p>
            </div>

            <div className="bg-linear-to-br from-emerald-500 to-emerald-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                    />
                  </svg>
                </div>
                <span className="text-white/80 text-sm bg-white/10 px-2 py-1 rounded-full">
                  {stats.summary.totalOrders}
                </span>
              </div>
              <p className="text-emerald-100 text-sm mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold">
                {stats.summary.totalOrders}
              </h3>
              <div className="flex gap-4 mt-2 text-xs text-emerald-100">
                <span>✓ {stats.ordersByStatus.completed} selesai</span>
                <span>⏳ {stats.ordersByStatus.pending} menunggu</span>
              </div>
            </div>

            <div className="bg-linear-to-br from-amber-500 to-amber-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-amber-100 text-sm mb-1">Total Users</p>
              <h3 className="text-2xl font-bold">{stats.summary.totalUsers}</h3>
              <div className="flex gap-4 mt-2 text-xs text-amber-100">
                <span>👤 {stats.summary.totalBuyers} buyers</span>
                <span>🏪 {stats.summary.totalSellers} sellers</span>
              </div>
            </div>

            <div className="bg-linear-to-br from-purple-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-white/20 p-3 rounded-xl backdrop-blur">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                </div>
              </div>
              <p className="text-purple-100 text-sm mb-1">Total Products</p>
              <h3 className="text-2xl font-bold">
                {stats.summary.totalProducts}
              </h3>
              <p className="text-purple-100 text-xs mt-2">
                Across all categories
              </p>
            </div>
          </div>

          {/* Revenue Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900">
                  Monthly Revenue Trend
                </h2>
                <select className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500">
                  <option>Last 12 Months</option>
                  <option>Last 6 Months</option>
                  <option>Last 3 Months</option>
                </select>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={stats.monthlyRevenue}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    tickFormatter={(value) => formatNumber(value)}
                  />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Order Status Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Order Status
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Pending", value: stats.ordersByStatus.pending },
                      {
                        name: "Processed",
                        value: stats.ordersByStatus.processed,
                      },
                      { name: "Shipped", value: stats.ordersByStatus.shipped },
                      {
                        name: "Completed",
                        value: stats.ordersByStatus.completed,
                      },
                      {
                        name: "Cancelled",
                        value: stats.ordersByStatus.cancelled,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => `${entry.name}: ${entry.value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {COLORS.map((color, index) => (
                      <Cell key={`cell-${index}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-gray-600">Pending</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                  <span className="text-gray-600">Processed</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                  <span className="text-gray-600">Shipped</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="text-gray-600">Completed</span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "analytics" && (
        <>
          {/* Daily Sales Chart */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Daily Sales (Last 30 Days)
              </h2>
              <div className="flex gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>{" "}
                  Revenue
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-500"></span>{" "}
                  Orders
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.dailySales}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 10 }}
                  tickLine={false}
                  interval="preserveStartEnd"
                />
                <YAxis
                  yAxisId="left"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(value: number, name: string) =>
                    name === "revenue" ? formatCurrency(value) : value
                  }
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={false}
                  name="Revenue"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="orders"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={false}
                  name="Orders"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* User Growth and Category Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Growth */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                User Growth (Last 7 Days)
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} />
                  <Tooltip />
                  <Bar
                    dataKey="buyers"
                    stackId="a"
                    fill="#10b981"
                    name="Buyers"
                  />
                  <Bar
                    dataKey="sellers"
                    stackId="a"
                    fill="#3b82f6"
                    name="Sellers"
                  />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Category Distribution */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Product Categories
              </h2>
              <div className="space-y-4">
                {stats.categoryDistribution
                  ?.slice(0, 5)
                  .map(
                    (
                      cat: { name: string; value: number; percentage?: string },
                      index: number,
                    ) => (
                      <div key={index}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700 font-medium">
                            {cat.name}
                          </span>
                          <span className="text-gray-500">
                            {cat.value} products ({cat.percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-linear-to-r from-emerald-500 to-emerald-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${cat.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ),
                  )}
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === "products" && (
        <>
          {/* Top Categories & Top Sellers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Categories */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">
                  Top Categories by Revenue
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.topCategories?.map(
                    (
                      category: {
                        id: string;
                        name: string;
                        productCount: number;
                        totalOrders: number;
                        totalRevenue: number;
                      },
                      index: number,
                    ) => (
                      <div
                        key={category.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-whit  e font-bold`}
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          >
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {category.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {category.productCount} products •{" "}
                              {category.totalOrders} orders
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">
                          {formatCurrency(category.totalRevenue)}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>

            {/* Top Sellers */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900">Top Sellers</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {stats.topSellers?.map(
                    (
                      seller: {
                        id: string;
                        name: string;
                        totalSales: number;
                        orderCount: number;
                        revenue: number;
                      },
                      index: number,
                    ) => (
                      <div
                        key={seller.id}
                        className="flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold`}
                            style={{
                              backgroundColor: COLORS[index % COLORS.length],
                            }}
                          >
                            {seller.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {seller.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {seller.orderCount} orders
                            </p>
                          </div>
                        </div>
                        <p className="font-bold text-gray-900">
                          {formatCurrency(seller.revenue)}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-lg font-bold text-gray-900">Recent Orders</h2>
              <a
                href="/admin/orders"
                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
              >
                View All →
              </a>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {stats.recentOrders?.map(
                    (order: {
                      id: string;
                      buyerName: string;
                      productName: string;
                      sellerName: string;
                      totalAmount: number;
                      status: string;
                      createdAt: string;
                    }) => (
                      <tr
                        key={order.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{order.id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.buyerName}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate">
                            {order.productName}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {order.sellerName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${
                            order.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : order.status === "pending"
                                ? "bg-yellow-100 text-yellow-800"
                                : order.status === "processed"
                                  ? "bg-blue-100 text-blue-800"
                                  : order.status === "shipped"
                                    ? "bg-purple-100 text-purple-800"
                                    : "bg-gray-100 text-gray-800"
                          }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            },
                          )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
