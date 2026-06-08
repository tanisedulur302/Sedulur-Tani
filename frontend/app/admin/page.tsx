"use client";

import { useEffect, useState } from "react";
import { dashboardApi } from "@/lib/api";
import {
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
  ComposedChart,
} from "recharts";

// Type Definitions
interface CategoryDistribution {
  name: string;
  value: number;
  percentage?: string;
  [key: string]: string | number | undefined;
}

interface MonthlyRevenue {
  month: string;
  revenue: number;
  orders: number;
}

interface RecentOrder {
  id: string;
  buyerName: string;
  productName: string;
  totalPrice: number;
  status: string;
}

interface OrdersByStatus {
  pending: number;
  processed: number;
  shipped: number;
  completed: number;
  cancelled: number;
}

interface DailySale {
  day: string;
  orders: number;
}

interface UserGrowth {
  day: string;
  buyers: number;
  sellers: number;
}

interface DashboardSummary {
  totalRevenue: number;
  totalOrders: number;
  totalUsers: number;
  totalProducts: number;
  totalBuyers: number;
  totalSellers: number;
}

interface DashboardStats {
  summary: DashboardSummary;
  categoryDistribution: CategoryDistribution[];
  monthlyRevenue: MonthlyRevenue[];
  recentOrders: RecentOrder[];
  ordersByStatus: OrdersByStatus;
  dailySales: DailySale[];
  userGrowth: UserGrowth[];
  notifications?: Notification[];
  recentActivities?: Activity[];
  quickStats?: QuickStats;
}

interface Notification {
  id: string;
  message: string;
  time: string;
  type: string;
  priority: string;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  target: string;
  time: string;
  type: string;
}

interface QuickStats {
  todaySales: number;
  newUsers: number;
  pendingOrders: number;
  lowStock: number;
}

interface SystemHealth {
  database: number;
  api: number;
  storage: number;
  cpu: number;
}

const COLORS = [
  "#10b981",
  "#3b82f6",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#06b6d4",
  "#84cc16",
];

export default function AdminDashboard(): React.ReactElement {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeSection, setActiveSection] = useState<
    "dashboard" | "products" | "orders" | "users" | "reports" | "settings"
  >("dashboard");
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("30d");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [systemHealth] = useState<SystemHealth>({
    database: 98,
    api: 99,
    storage: 75,
    cpu: 45,
  });
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats>({
    todaySales: 0,
    newUsers: 0,
    pendingOrders: 0,
    lowStock: 0,
  });

  const fetchAllData = async (): Promise<void> => {
    try {
      setLoading(true);
      // Clear previous data to ensure chart re-renders with fresh data
      setStats(null);

      const response = await dashboardApi.getAdminStats();
      const data = response.data.data;
      setStats(data);

      if (data.categoryDistribution) {
        const total = data.categoryDistribution.reduce(
          (sum: number, cat: CategoryDistribution) => sum + cat.value,
          0,
        );
        data.categoryDistribution.forEach((cat: CategoryDistribution) => {
          cat.percentage =
            total > 0 ? ((cat.value / total) * 100).toFixed(1) : "0";
        });
      }

      // Set real data from backend
      if (data.notifications) {
        // Format time for notifications
        const formattedNotifications = data.notifications.map(
          (n: Notification) => ({
            ...n,
            time: formatTimeAgo(n.time),
          }),
        );
        setNotifications(formattedNotifications);
      }

      if (data.recentActivities) {
        // Format time for activities
        const formattedActivities = data.recentActivities.map(
          (a: Activity) => ({
            ...a,
            time: formatTimeAgo(a.time),
          }),
        );
        setRecentActivities(formattedActivities);
      }

      if (data.quickStats) {
        setQuickStats(data.quickStats);
      }
    } catch (error: unknown) {
      console.error("Failed to fetch dashboard data", error);
      console.error("Error type:", typeof error);
      console.error(
        "Error keys:",
        error && typeof error === "object" ? Object.keys(error) : [],
      );
      console.error("Error string:", String(error));

      const err = error as {
        message?: string;
        code?: string;
        response?: { status?: number; data?: unknown };
        config?: { baseURL?: string; url?: string };
      };
      console.error("Error message:", err?.message);
      console.error("Error code:", err?.code);
      console.error("Error response:", err?.response);
      console.error("Error config:", err?.config);

      // Show alert with error details for debugging
      const errorMsg = `Type: ${typeof error}
Message: ${err?.message || "N/A"}
Code: ${err?.code || "N/A"}
Status: ${err?.response?.status || "N/A"}
URL: ${err?.config?.baseURL || ""}${err?.config?.url || ""}
Response Data: ${JSON.stringify(err?.response?.data || "N/A")}
Token exists: ${localStorage.getItem("token") ? "YES" : "NO"}`;

      console.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " tahun lalu";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " bulan lalu";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " hari lalu";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " jam lalu";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " menit lalu";
    return Math.floor(seconds) + " detik lalu";
  };

  const formatCurrency = (value: number): string => {
    return `Rp ${value.toLocaleString("id-ID")}`;
  };

  const getHealthColor = (value: number): string => {
    if (value >= 90) return "text-emerald-600";
    if (value >= 70) return "text-amber-600";
    return "text-red-600";
  };

  const getHealthBg = (value: number): string => {
    if (value >= 90) return "bg-emerald-500";
    if (value >= 70) return "bg-amber-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 bg-gray-50/50 min-h-screen">
      {/* Enhanced Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Monitor performance and manage your store
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value)}
            className="px-3 py-1.5 text-sm border-none bg-transparent focus:ring-0 text-gray-600 font-medium cursor-pointer hover:text-gray-900"
          >
            <option value="1d">Today</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="1y">Last Year</option>
          </select>
          <div className="w-px h-4 bg-gray-200"></div>
          <button className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <div className="flex gap-6 overflow-x-auto pb-px">
          {[
            { id: "dashboard", label: "Overview" },
            { id: "products", label: "Product Analytics" },
            { id: "orders", label: "Order Analytics" },
            { id: "users", label: "User Analytics" },
            { id: "reports", label: "Reports" },
            { id: "settings", label: "Settings" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSection(tab.id as typeof activeSection)}
              className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                activeSection === tab.id
                  ? "text-emerald-600 border-b-2 border-emerald-600"
                  : "text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
          <svg
            className="w-4 h-4 text-emerald-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Add Product
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
          <svg
            className="w-4 h-4 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export Data
        </button>
        <button className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
          <svg
            className="w-4 h-4 text-purple-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
          Broadcast
        </button>
      </div>

      {/* Main Content Area */}
      {activeSection === "dashboard" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Stats & Charts */}
          <div className="lg:col-span-2 space-y-8">
            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-blue-50 rounded-lg">
                    <svg
                      className="w-6 h-6 text-blue-600"
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
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    +12.5%
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Revenue
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {formatCurrency(stats.summary.totalRevenue)}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-emerald-50 rounded-lg">
                    <svg
                      className="w-6 h-6 text-emerald-600"
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
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Orders
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.summary.totalOrders}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-amber-50 rounded-lg">
                    <svg
                      className="w-6 h-6 text-amber-600"
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
                  <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                    +{quickStats.newUsers} new
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Users
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.summary.totalUsers}
                  </h3>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2.5 bg-purple-50 rounded-lg">
                    <svg
                      className="w-6 h-6 text-purple-600"
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
                  <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full">
                    {quickStats.lowStock} low stock
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    Total Products
                  </p>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">
                    {stats.summary.totalProducts}
                  </h3>
                </div>
              </div>
            </div>

            {/* Revenue Chart */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Revenue & Orders Trend
                  </h2>
                  <p className="text-sm text-gray-500">
                    Monthly performance overview
                  </p>
                </div>
                <div className="flex gap-3">
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-3 h-3 rounded-full bg-emerald-500"></span>{" "}
                    Revenue
                  </span>
                  <span className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="w-3 h-3 rounded-full bg-blue-500"></span>{" "}
                    Orders
                  </span>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <ComposedChart data={stats.monthlyRevenue}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    dx={10}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="revenue"
                    fill="#10b981"
                    stroke="#10b981"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{
                      r: 4,
                      fill: "#3b82f6",
                      strokeWidth: 2,
                      stroke: "#fff",
                    }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            {/* Category Performance */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Category Performance
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={stats.categoryDistribution?.slice(0, 6)}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="#f0f0f0"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip
                    cursor={{ fill: "#f9fafb" }}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="value"
                    fill="#10b981"
                    radius={[4, 4, 0, 0]}
                    barSize={40}
                  >
                    {stats.categoryDistribution
                      ?.slice(0, 6)
                      .map((entry: CategoryDistribution, index: number) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Recent Orders
                  </h2>
                  <p className="text-sm text-gray-500">
                    Latest transactions from users
                  </p>
                </div>
                <a
                  href="/admin/orders"
                  className="text-emerald-600 hover:text-emerald-700 text-sm font-medium inline-flex items-center gap-1"
                >
                  View All{" "}
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </a>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Order ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.recentOrders
                      ?.slice(0, 5)
                      .map((order: RecentOrder) => (
                        <tr
                          key={order.id}
                          className="hover:bg-gray-50/50 transition-colors"
                        >
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            #{order.id.substring(0, 8)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                                {order.buyerName.charAt(0)}
                              </div>
                              {order.buyerName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div
                              className="max-w-[150px] truncate"
                              title={order.productName}
                            >
                              {order.productName}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900">
                            {formatCurrency(order.totalPrice)}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-2.5 py-1 inline-flex text-xs leading-5 font-medium rounded-full border ${
                                order.status === "completed"
                                  ? "bg-green-50 text-green-700 border-green-100"
                                  : order.status === "pending"
                                    ? "bg-yellow-50 text-yellow-700 border-yellow-100"
                                    : order.status === "shipped"
                                      ? "bg-blue-50 text-blue-700 border-blue-100"
                                      : "bg-gray-50 text-gray-700 border-gray-100"
                              }`}
                            >
                              {order.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Notifications & Widgets */}
          <div className="space-y-8">
            {/* System Health Monitor */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg
                  className="w-4 h-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                System Health
              </h3>
              <div className="space-y-4">
                {Object.entries(systemHealth).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-gray-600 capitalize">
                        {key}
                      </span>
                      <span
                        className={`text-xs font-bold ${getHealthColor(value)}`}
                      >
                        {value}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${getHealthBg(value)}`}
                        style={{ width: `${value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notifications Panel */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-900">
                  Notifications
                </h3>
                <span className="text-xs bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-medium border border-red-100">
                  {notifications.filter((n) => n.priority === "high").length}{" "}
                  urgent
                </span>
              </div>
              <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors group"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2 rounded-lg shrink-0 ${
                          notif.type === "order"
                            ? "bg-blue-50 text-blue-600"
                            : notif.type === "product"
                              ? "bg-amber-50 text-amber-600"
                              : notif.type === "user"
                                ? "bg-green-50 text-green-600"
                                : notif.type === "payment"
                                  ? "bg-purple-50 text-purple-600"
                                  : "bg-gray-50 text-gray-600"
                        }`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                          />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900 font-medium truncate">
                          {notif.message}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {notif.time}
                        </p>
                      </div>
                      {notif.priority === "high" && (
                        <span className="w-2 h-2 bg-red-500 rounded-full shrink-0 mt-1.5"></span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 text-center border-t border-gray-50">
                <button className="text-xs text-emerald-600 hover:text-emerald-700 font-medium hover:underline">
                  View All Notifications
                </button>
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <h3 className="text-sm font-bold text-gray-900">
                  Recent Activity
                </h3>
              </div>
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                {recentActivities.map((activity, idx) => (
                  <div
                    key={activity.id}
                    className="p-4 border-b border-gray-50 hover:bg-gray-50/50 transition-colors relative"
                  >
                    {idx !== recentActivities.length - 1 && (
                      <div className="absolute left-[27px] top-10 bottom-0 w-px bg-gray-100"></div>
                    )}
                    <div className="flex items-start gap-3 relative z-10">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-sm border-2 border-white ${
                          activity.type === "create"
                            ? "bg-green-500"
                            : activity.type === "purchase"
                              ? "bg-blue-500"
                              : activity.type === "review"
                                ? "bg-yellow-500"
                                : activity.type === "update"
                                  ? "bg-purple-500"
                                  : "bg-gray-500"
                        }`}
                      >
                        {activity.user.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">
                          <span className="font-semibold">{activity.user}</span>
                          <span className="text-gray-600">
                            {" "}
                            {activity.action}{" "}
                          </span>
                          <span className="font-medium text-gray-900">
                            {activity.target}
                          </span>
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {activity.time}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      {activeSection === "products" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Product Management
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Stats */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  Product Statistics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-2xl font-bold text-emerald-700">
                      {stats.summary.totalProducts}
                    </p>
                    <p className="text-sm text-emerald-600">Total Products</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-2xl font-bold text-amber-700">
                      {quickStats.lowStock}
                    </p>
                    <p className="text-sm text-amber-600">Low Stock</p>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-700">
                      {stats.categoryDistribution?.length || 0}
                    </p>
                    <p className="text-sm text-blue-600">Categories</p>
                  </div>
                  <div className="p-4 bg-purple-50 rounded-lg">
                    <p className="text-2xl font-bold text-purple-700">
                      {stats.summary.totalSellers}
                    </p>
                    <p className="text-sm text-purple-600">Active Sellers</p>
                  </div>
                </div>
              </div>

              {/* Category Distribution Chart */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  Category Distribution
                </h3>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={stats.categoryDistribution?.slice(0, 5)}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => `${entry.name}: ${entry.value}`}
                      outerRadius={70}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {stats.categoryDistribution
                        ?.slice(0, 5)
                        .map((entry: CategoryDistribution, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                          />
                        ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Product Management Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Add New Product
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Import Products
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Manage Categories
              </button>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Stock Alert Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Orders Section */}
      {activeSection === "orders" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Order Management
            </h2>

            {/* Order Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-2xl font-bold text-yellow-700">
                  {stats.ordersByStatus.pending}
                </p>
                <p className="text-sm text-yellow-600">Pending</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-700">
                  {stats.ordersByStatus.processed}
                </p>
                <p className="text-sm text-blue-600">Processed</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <p className="text-2xl font-bold text-purple-700">
                  {stats.ordersByStatus.shipped}
                </p>
                <p className="text-sm text-purple-600">Shipped</p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-700">
                  {stats.ordersByStatus.completed}
                </p>
                <p className="text-sm text-green-600">Completed</p>
              </div>
              <div className="p-4 bg-red-50 rounded-lg">
                <p className="text-2xl font-bold text-red-700">
                  {stats.ordersByStatus.cancelled}
                </p>
                <p className="text-sm text-red-600">Cancelled</p>
              </div>
            </div>

            {/* Order Trend Chart */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Daily Order Trend
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats.dailySales}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="orders"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Order Management Actions */}
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Process Pending Orders
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export Orders
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Print Shipping Labels
              </button>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Refund Management
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Section */}
      {activeSection === "users" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              User Management
            </h2>

            {/* User Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div>
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  User Statistics
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Users</span>
                    <span className="text-lg font-bold text-gray-900">
                      {stats.summary.totalUsers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Buyers</span>
                    <span className="text-lg font-bold text-gray-900">
                      {stats.summary.totalBuyers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Sellers</span>
                    <span className="text-lg font-bold text-gray-900">
                      {stats.summary.totalSellers}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">New Today</span>
                    <span className="text-lg font-bold text-emerald-600">
                      +{quickStats.newUsers}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Growth Chart */}
              <div className="lg:col-span-2">
                <h3 className="text-sm font-bold text-gray-700 mb-3">
                  User Growth (Last 7 Days)
                </h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={stats.userGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Bar dataKey="buyers" stackId="a" fill="#10b981" />
                    <Bar dataKey="sellers" stackId="a" fill="#3b82f6" />
                    <Legend />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Management Actions */}
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Add New User
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                Export User Data
              </button>
              <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                Verify Sellers
              </button>
              <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700">
                Send Newsletter
              </button>
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Manage Permissions
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports Section */}
      {activeSection === "reports" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Reports & Analytics
            </h2>

            {/* Report Types */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="p-6 bg-linear-to-br from-blue-50 to-blue-100 rounded-xl">
                <svg
                  className="w-12 h-12 text-blue-600 mb-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                <h3 className="font-bold text-gray-900 mb-2">Sales Report</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Detailed sales analysis and trends
                </p>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Generate →
                </button>
              </div>

              <div className="p-6 bg-linear-to-br from-emerald-50 to-emerald-100 rounded-xl">
                <svg
                  className="w-12 h-12 text-emerald-600 mb-3"
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
                <h3 className="font-bold text-gray-900 mb-2">
                  Inventory Report
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  Stock levels and product performance
                </p>
                <button className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Generate →
                </button>
              </div>

              <div className="p-6 bg-linear-to-br from-purple-50 to-purple-100 rounded-xl">
                <svg
                  className="w-12 h-12 text-purple-600 mb-3"
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
                <h3 className="font-bold text-gray-900 mb-2">
                  Customer Report
                </h3>
                <p className="text-sm text-gray-600 mb-4">
                  User behavior and demographics
                </p>
                <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                  Generate →
                </button>
              </div>
            </div>

            {/* Schedule Reports */}
            <div className="mt-6 p-4 bg-gray-50 rounded-xl">
              <h3 className="text-sm font-bold text-gray-700 mb-3">
                Scheduled Reports
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Weekly Sales Summary
                    </p>
                    <p className="text-xs text-gray-500">
                      Every Monday at 9:00 AM
                    </p>
                  </div>
                  <button className="text-sm text-emerald-600">Edit</button>
                </div>
                <div className="flex justify-between items-center p-3 bg-white rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Monthly Inventory Report
                    </p>
                    <p className="text-xs text-gray-500">1st of every month</p>
                  </div>
                  <button className="text-sm text-emerald-600">Edit</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Settings Section */}
      {activeSection === "settings" && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              System Settings
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* General Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700">
                  General Settings
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">
                      Site Maintenance
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">
                      Email Notifications
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Auto Backup</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Security Settings */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-700">
                  Security Settings
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">
                      Two-Factor Auth
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Login Alerts</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">
                      API Rate Limiting
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
              <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Save Settings
              </button>
              <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
                Reset to Default
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
