import React, { useEffect, useMemo, useState } from "react";
import axios from "../../../api/axiosInstance";
import SupplierSidebar from "../Suppliersidebar";
import SupplierTopbar from "../SupplierTopbar";
import "./SupplierBuyers.css";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

const money = (n = 0) =>
  `Rs. ${Number(n || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;

const formatValue = (value) => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`;
  }
  return value.toString();
};

const safeLower = (v) => (v ? String(v).toLowerCase() : "");

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "S";
};

// Color palette for bars
const CHART_COLORS = ["#10b981", "#3b82f6", "#8b5cf6", "#f59e0b"];

const SupplierBuyers = () => {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("all");

  const [page, setPage] = useState(1);
  const perPage = 6;

  // Fetch buyers list from backend
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await axios.get("/supermarkets/buyers");
        const arr = Array.isArray(res.data) ? res.data : [];
        setBuyers(arr);
      } catch (e) {
        console.error("Buyers fetch failed:", e);
        setBuyers([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  // District list for dropdown
  const districts = useMemo(() => {
    const set = new Set();
    buyers.forEach((b) => {
      if (b.district) set.add(b.district);
    });
    return ["all", ...Array.from(set).sort()];
  }, [buyers]);

  // Filtered buyers
  const filtered = useMemo(() => {
    const q = safeLower(search.trim());
    return buyers.filter((b) => {
      const matchesDistrict = district === "all" || b.district === district;
      const matchesSearch =
        !q ||
        safeLower(b.name).includes(q) ||
        safeLower(b.contactEmail).includes(q) ||
        safeLower(b.district).includes(q);
      return matchesDistrict && matchesSearch;
    });
  }, [buyers, search, district]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const pageSafe = Math.min(page, totalPages);
  const start = (pageSafe - 1) * perPage;
  const pageItems = filtered.slice(start, start + perPage);

  useEffect(() => {
    setPage(1);
  }, [search, district]);

  // Stats
  const stats = useMemo(() => {
    const totalSupermarkets = buyers.length;
    const totalOrders = buyers.reduce((acc, b) => acc + Number(b.totalOrders || 0), 0);
    const totalRevenue = buyers.reduce((acc, b) => acc + Number(b.totalRevenue || 0), 0);
    return { totalSupermarkets, totalOrders, totalRevenue };
  }, [buyers]);

  // Top districts chart data (by revenue)
  const topDistricts = useMemo(() => {
    const map = {};
    buyers.forEach((b) => {
      const d = b.district || "Unknown";
      map[d] = (map[d] || 0) + Number(b.totalRevenue || 0);
    });

    const arr = Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);

    return arr;
  }, [buyers]);

  const showingFrom = filtered.length === 0 ? 0 : start + 1;
  const showingTo = Math.min(start + perPage, filtered.length);

  // Custom label renderer for bars
  const renderCustomLabel = (props) => {
    const { x, y, width, value } = props;
    return (
      <text
        x={x + width / 2}
        y={y - 8}
        fill="#0f172a"
        textAnchor="middle"
        fontSize="13"
        fontWeight="700"
      >
        {formatValue(value)}
      </text>
    );
  };

  return (
    <div className="supplier-layout">
      <SupplierSidebar />
      <div className="supplier-main-content">
        <SupplierTopbar />

        <div className="buyers-page">
          {/* Header */}
          <div className="buyers-header">
            <h1 className="buyers-title">Buyers / Supermarkets</h1>
            <p className="buyers-subtitle">
              Here is the list of supermarkets that have purchased from you. Click 'View' to
              see order history and details.
            </p>
          </div>

          {/* Stats cards */}
          <div className="buyers-stats">
            <div className="bcard purple">
              <div className="bcard-left">
                <div className="bcard-label">Total Supermarkets</div>
                <div className="bcard-value">{stats.totalSupermarkets}</div>
              </div>
              <div className="bcard-icon purple">📦</div>
            </div>

            <div className="bcard blue">
              <div className="bcard-left">
                <div className="bcard-label">Total Orders</div>
                <div className="bcard-value">{stats.totalOrders}</div>
              </div>
              <div className="bcard-icon blue">🛒</div>
            </div>

            <div className="bcard green">
              <div className="bcard-left">
                <div className="bcard-label">Total Revenue</div>
                <div className="bcard-value">{money(stats.totalRevenue)}</div>
              </div>
              <div className="bcard-icon green">✓</div>
            </div>
          </div>

          {/* Main grid */}
          <div className="buyers-grid">
            {/* LEFT: Table */}
            <div className="buyers-left">
              {/* Filters */}
              <div className="buyers-filters">
                <div className="buyers-search">
                  <span className="icon">🔍</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search supermarkets..."
                  />
                </div>

                <select value={district} onChange={(e) => setDistrict(e.target.value)}>
                  {districts.map((d) => (
                    <option key={d} value={d}>
                      {d === "all" ? "All Districts" : d}
                    </option>
                  ))}
                </select>
              </div>

              <div className="buyers-section-title">Your Buyers</div>

              <div className="buyers-table-card">
                {loading ? (
                  <div className="buyers-loading">
                    <div className="spinner" />
                    <p>Loading buyers...</p>
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="buyers-empty">
                    <p>No buyers found.</p>
                    {buyers.length === 0 && (
                      <small style={{ color: '#94a3b8', marginTop: '8px', display: 'block' }}>
                        Your buyer list will populate when supermarkets place orders.
                      </small>
                    )}
                  </div>
                ) : (
                  <>
                    <table className="buyers-table">
                      <thead>
                        <tr>
                          <th>SUPERMARKET</th>
                          <th>DISTRICT</th>
                          <th>CONTACT EMAIL</th>
                          <th>TOTAL ORDERS</th>
                          <th>TOTAL REVENUE</th>
                          <th>VIEW</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pageItems.map((b) => (
                          <tr key={b.supermarketId || b._id || b.name}>
                            <td className="sm-cell">
                              <div className="sm-wrap">
                                {b.logoUrl ? (
                                  <img className="sm-logo" src={b.logoUrl} alt={b.name} />
                                ) : (
                                  <div className="sm-logo-fallback">{getInitials(b.name)}</div>
                                )}
                                <div className="sm-name">
                                  <div className="sm-title">{b.name || "Unknown"}</div>
                                  <div className="sm-sub">{b.district || ""}</div>
                                </div>
                              </div>
                            </td>
                            <td>{b.district || "-"}</td>
                            <td className="truncate">{b.contactEmail || "-"}</td>
                            <td>{Number(b.totalOrders || 0).toLocaleString()}</td>
                            <td>{money(b.totalRevenue || 0)}</td>
                            <td>
                              <button
                                className="view-btn"
                                onClick={() => {
                                  // TODO: Navigate to buyer details page
                                  console.log(`View details for ${b.name}`);
                                }}
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {/* Pagination footer */}
                    <div className="buyers-footer">
                      <div className="buyers-range">
                        {showingFrom}-{showingTo} of {filtered.length}
                      </div>

                      <div className="buyers-pagination">
                        <button
                          className="pg-btn"
                          disabled={pageSafe <= 1}
                          onClick={() => setPage((p) => Math.max(1, p - 1))}
                        >
                          ‹ Prev
                        </button>
                        <div className="pg-pill">{pageSafe}</div>
                        <button
                          className="pg-btn"
                          disabled={pageSafe >= totalPages}
                          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        >
                          Next ›
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Chart */}
            <div className="buyers-right">
              <div className="chart-card">
                <div className="chart-title">Top Districts</div>

                {topDistricts.length === 0 ? (
                  <div className="buyers-empty">
                    <p>No district data yet.</p>
                  </div>
                ) : (
                  <div className="chart-wrap">
                    {/* Main chart with labels on top */}
                    <ResponsiveContainer width="100%" height={240}>
                      <BarChart 
                        data={topDistricts} 
                        margin={{ top: 30, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fontSize: 13, fill: '#64748b', fontWeight: 500 }}
                          tickLine={false}
                          axisLine={{ stroke: '#e2e8f0' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 12, fill: '#94a3b8' }}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip 
                          formatter={(v) => money(v)}
                          contentStyle={{
                            background: 'white',
                            border: '1px solid #e2e8f0',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          }}
                          cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                        />
                        <Bar 
                          dataKey="value" 
                          radius={[10, 10, 0, 0]}
                        >
                          {topDistricts.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                          ))}
                          <LabelList content={renderCustomLabel} />
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>

                    {/* Mini chart */}
                    <div className="mini-chart">
                      <ResponsiveContainer width="100%" height={180}>
                        <BarChart 
                          data={topDistricts} 
                          margin={{ top: 30, right: 20, left: 0, bottom: 5 }}
                        >
                          <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12, fill: '#64748b', fontWeight: 500 }}
                            tickLine={false}
                            axisLine={{ stroke: '#e2e8f0' }}
                          />
                          <Tooltip 
                            formatter={(v) => money(v)}
                            contentStyle={{
                              background: 'white',
                              border: '1px solid #e2e8f0',
                              borderRadius: '10px',
                              padding: '8px 12px',
                              boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                            cursor={{ fill: 'rgba(59, 130, 246, 0.05)' }}
                          />
                          <Bar 
                            dataKey="value" 
                            radius={[10, 10, 0, 0]}
                          >
                            {topDistricts.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                            <LabelList content={renderCustomLabel} />
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupplierBuyers;