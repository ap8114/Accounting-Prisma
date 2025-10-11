import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  BsBuilding,
  BsPeople,
  BsCurrencyDollar,
  BsPersonPlus,
  BsCalendar2,
} from "react-icons/bs";
import "./Dashboardd.css";
import BaseUrl from "../../Api/BaseUrl";
import axiosInstance from "../../Api/axiosInstance";

const Dashboardd = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await axiosInstance.get(`${BaseUrl}superadmindhasboard`);
        setDashboardData(response.data.data);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err.response?.data?.message || err.message || "Failed to fetch dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Process chart data from API response
  const getChartData = () => {
    if (!dashboardData) return [];
    
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                       "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    
    // Create a map for all months (initialize with zeros)
    const monthlyMap = {};
    for (let i = 1; i <= 12; i++) {
      monthlyMap[i] = {
        name: monthNames[i - 1],
        Growth: 0,
        users: 0,
        revenue: 0,
      };
    }
    
    // Update with actual data from API
    dashboardData.growth.forEach(item => {
      if (monthlyMap[item.month]) {
        monthlyMap[item.month].Growth = item.count;
      }
    });
    
    dashboardData.signupCompanies.forEach(item => {
      if (monthlyMap[item.month]) {
        monthlyMap[item.month].users = item.count;
      }
    });
    
    dashboardData.revenueTrends.forEach(item => {
      if (monthlyMap[item.month]) {
        monthlyMap[item.month].revenue = parseFloat(item.revenue) || 0;
      }
    });
    
    // Convert map to array and sort by month
    return Object.values(monthlyMap);
  };

  // Calculate growth percentage if possible
  const calculateGrowth = (current, previous) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const percentage = ((current - previous) / previous) * 100;
    return `${percentage > 0 ? '+' : ''}${percentage.toFixed(1)}%`;
  };

  if (loading) return <div className="text-center py-5">Loading dashboard...</div>;
  if (error) return <div className="alert alert-danger">Error: {error}</div>;
  if (!dashboardData) return <div className="alert alert-warning">No dashboard data available</div>;

  const chartData = getChartData();
  
  // Get current month data for growth calculations
  const currentMonth = new Date().getMonth() + 1; // 1-12
  const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  
  const currentMonthData = chartData.find(item => item.name === ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][currentMonth - 1]);
  const previousMonthData = chartData.find(item => item.name === ["Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][previousMonth - 1]);

  return (
    <div className="dashboard container-fluid py-4 px-3">
      {/* Cards Section */}
      <div className="row g-4 mb-4">
        {[
          {
            icon: <BsBuilding />,
            value: dashboardData.total_companies.toString(),
            label: "Total Company",
            growth: currentMonthData && previousMonthData ? 
              calculateGrowth(currentMonthData.Growth, previousMonthData.Growth) : "+12.5%",
            bg: "success",
          },
          {
            icon: <BsPeople />,
            value: dashboardData.total_requests.toString(),
            label: "Total Request",
            growth: "+8.2%", // Keeping static as we don't have historical data
            bg: "success",
          },
          {
            icon: <BsCurrencyDollar />,
            value: `$${parseFloat(dashboardData.total_revenue).toFixed(2)}`,
            label: "Total Revenue",
            growth: currentMonthData && previousMonthData ? 
              calculateGrowth(currentMonthData.revenue, previousMonthData.revenue) : "+15.3%",
            bg: "success",
          },
          {
            icon: <BsPersonPlus />,
            value: dashboardData.new_signups.toString(),
            label: "New Signups Company",
            growth: "Today",
            bg: "primary text-white",
          },
        ].map((card, index) => (
          <div className="col-12 col-sm-6 col-lg-3" key={index}>
            <div className="card h-100 shadow-sm stat-card">
              <div className="card-body d-flex justify-content-between align-items-start">
                <div className="icon-box fs-4 text-dark">{card.icon}</div>
                <div
                  className={`badge bg-${card.bg} rounded-pill px-3 py-1 fw-semibold`}
                >
                  {card.growth}
                </div>
              </div>
              <div className="card-body pt-0">
                <h4 className="fw-bold mb-1">{card.value}</h4>
                <p className="text-muted mb-0">{card.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="row g-4">
        {/* Line Chart - Growth */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header">
              <h6 className="m-0 fw-bold">Total Growth</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Growth"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bar Chart - Signup */}
        <div className="col-12 col-md-6">
          <div className="card shadow-sm h-100">
            <div className="card-header">
              <h6 className="m-0 fw-bold">Signup Company</h6>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="users" fill="#53b2a5" name="Signup Company" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Area Chart - Revenue */}
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="m-0 fw-bold">Revenue Trends</h6>
              <button className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-2">
                <BsCalendar2 /> 2025
              </button>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8b5cf6"
                    fill="#8b5cf6"
                    fillOpacity={0.2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboardd;