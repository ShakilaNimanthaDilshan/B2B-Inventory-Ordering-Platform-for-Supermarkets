// frontend/src/pages/supplier/SupplierDashboard.jsx

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./SupplierDashboard.css";

// Charts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b"];

const SupplierDashboard = () => {
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const token = localStorage.getItem("token");

        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        const [productRes, orderRes] = await Promise.all([
          axios.get("/api/products/my-products", config),
          axios.get("/api/orders/supplier", config),
        ]);

        setProducts(productRes.data);
        setOrders(orderRes.data);
      } catch (err) {
        console.error("Dashboard fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) return <div className="loading-container"><p>Loading dashboard...</p></div>;

  // ---------- STAT COMPUTATION ----------
  const totalProducts = products.length;
  const activeProducts = products.filter((p) => p.isActive !== false).length;
  const lowStockProducts = products.filter((p) => p.stock <= 10).length;

  // ---------- PIE CHART DATA ----------
  const stockData = [
    { name: "Good Stock", value: products.filter((p) => p.stock > 20).length },
    { name: "Medium Stock", value: products.filter((p) => p.stock > 10 && p.stock <= 20).length },
    { name: "Low Stock", value: lowStockProducts },
  ];

  // ---------- ORDERS LINE CHART DATA ----------
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const ordersByMonth = {};
  
  // Initialize all months with 0
  monthNames.forEach(month => {
    ordersByMonth[month] = 0;
  });
  
  orders.forEach((order) => {
    const date = new Date(order.createdAt);
    const month = monthNames[date.getMonth()];
    ordersByMonth[month] = (ordersByMonth[month] || 0) + 1;
  });

  const monthlyOrdersData = monthNames.map((month) => ({
    month,
    orders: ordersByMonth[month],
  }));

  // Get low stock products for table
  const lowStockProductsList = products
    .filter((p) => p.stock <= 15)
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 5);

  return (
    <div className="supplier-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Supplier Dashboard</h1>
          <p className="dashboard-subtitle">
            Manage your products, update stock, and track performance.
          </p>
        </div>
      </div>

      {/* ---------- STAT CARDS ---------- */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Total Products</div>
            <div className="stat-value">{totalProducts.toLocaleString()}</div>
          </div>
          <div className="stat-icon stat-icon-purple">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
              <line x1="12" y1="22.08" x2="12" y2="12"></line>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Active Products</div>
            <div className="stat-value">{activeProducts.toLocaleString()}</div>
          </div>
          <div className="stat-icon stat-icon-green">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-label">Low Stock Items</div>
            <div className="stat-value">{lowStockProducts}</div>
          </div>
          <div className="stat-icon stat-icon-yellow">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
          </div>
        </div>
      </div>

      {/* ---------- CHARTS SECTION ---------- */}
      <div className="charts-container">
        
        {/* PIE CHART */}
        <div className="chart-card">
          <h3 className="chart-title">Stock Overview</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={stockData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                paddingAngle={2}
              >
                {stockData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend 
                verticalAlign="bottom" 
                height={36}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* LINE CHART */}
        <div className="chart-card chart-card-wide">
          <h3 className="chart-title">Monthly Orders</h3>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={monthlyOrdersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <YAxis 
                allowDecimals={false}
                tick={{ fill: '#6b7280', fontSize: 12 }}
                axisLine={{ stroke: '#e5e7eb' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="orders" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

      </div>

      {/* ---------- QUICK ACTIONS ---------- */}
      <div className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="action-buttons">
          <button
            className="action-btn action-btn-primary"
            onClick={() => navigate("/supplier/products")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
            </svg>
            Manage Products
          </button>

          <button
            className="action-btn action-btn-secondary"
            onClick={() => navigate("/supplier/add-product")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            Add New Product
          </button>

          <button
            className="action-btn action-btn-outline"
            onClick={() => navigate("/supplier/orders")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"></path>
            </svg>
            View Incoming Orders
          </button>
        </div>
      </div>

      {/* ---------- LOW STOCK PRODUCTS TABLE ---------- */}
      <div className="low-stock-section">
        <div className="section-header">
          <div className="section-icon">⚠️</div>
          <h3 className="section-title">Low Stock Products</h3>
        </div>
        
        {lowStockProductsList.length > 0 ? (
          <div className="products-table">
            <table>
              <thead>
                <tr>
                  <th>PRODUCT NAME</th>
                  <th>CATEGORY</th>
                  <th>STOCK</th>
                  <th>PRICE</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProductsList.map((product) => (
                  <tr key={product._id}>
                    <td className="product-name">{product.name}</td>
                    <td className="product-category">{product.category || 'N/A'}</td>
                    <td>
                      <span className={`stock-badge ${
                        product.stock <= 5 ? 'stock-critical' : 
                        product.stock <= 10 ? 'stock-low' : 
                        'stock-medium'
                      }`}>
                        {product.stock} units
                      </span>
                    </td>
                    <td className="product-price">${product.price?.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data-message">All products are well stocked! 🎉</p>
        )}
      </div>
    </div>
  );
};

export default SupplierDashboard;

