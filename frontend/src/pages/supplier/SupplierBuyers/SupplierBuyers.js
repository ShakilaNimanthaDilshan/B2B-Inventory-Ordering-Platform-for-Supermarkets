import React, { useEffect, useMemo, useState } from "react";
import axios from "../../../api/axiosInstance";
import SupplierSidebar from "../Suppliersidebar";
import SupplierTopbar from "../SupplierTopbar";
import "./SupplierBuyers.css";
import SriLankaLeafletMap from "../../../components/SriLankaLeafletMap";



const money = (n = 0) =>
  `Rs. ${Number(n || 0).toLocaleString("en-LK", { maximumFractionDigits: 0 })}`;

const formatValue = (value) => {
  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return value.toString();
};

const safeLower = (v) => (v ? String(v).trim().toLowerCase() : "");

const getInitials = (name = "") => {
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "S";
};



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

  
  const districtCanonicalMap = useMemo(() => {
    const map = {};
    buyers.forEach((b) => {
      if (!b?.district) return;
      const key = safeLower(b.district);
      if (key && !map[key]) map[key] = b.district; // keep first seen "nice" value
    });
    return map;
  }, [buyers]);

  // District list for dropdown
  const districts = useMemo(() => {
    const set = new Set();
    buyers.forEach((b) => {
      if (b.district) set.add(b.district);
    });
    return ["all", ...Array.from(set).sort()];
  }, [buyers]);

  // Filtered buyers (district matching is case-insensitive now ✅)
  const filtered = useMemo(() => {
    const q = safeLower(search);
    const selectedKey = safeLower(district);

    return buyers.filter((b) => {
      const buyerDistrictKey = safeLower(b.district);

      const matchesDistrict =
        district === "all" || buyerDistrictKey === selectedKey;

      const matchesSearch =
        !q ||
        safeLower(b.name).includes(q) ||
        safeLower(b.contactEmail).includes(q) ||
        buyerDistrictKey.includes(q);

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
    const totalOrders = buyers.reduce(
      (acc, b) => acc + Number(b.totalOrders || 0),
      0
    );
    const totalRevenue = buyers.reduce(
      (acc, b) => acc + Number(b.totalRevenue || 0),
      0
    );
    return { totalSupermarkets, totalOrders, totalRevenue };
  }, [buyers]);

  // Top districts chart data (by revenue)
  const topDistricts = useMemo(() => {
    const map = {};
    buyers.forEach((b) => {
      const d = b.district || "Unknown";
      map[d] = (map[d] || 0) + Number(b.totalRevenue || 0);
    });

    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 4);
  }, [buyers]);

  //  Map data: districtStats (keyed by lower-case district name)
  const districtStats = useMemo(() => {
    const out = {};
    buyers.forEach((b) => {
      const d = safeLower(b.district);
      if (!d) return;

      out[d] = out[d] || { buyers: 0, orders: 0, revenue: 0 };
      out[d].buyers += 1;
      out[d].orders += Number(b.totalOrders || 0);
      out[d].revenue += Number(b.totalRevenue || 0);
    });
    return out;
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
              Here is the list of supermarkets that have purchased from you.
              Click 'View' to see order history and details.
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

                <select
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                >
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
                      <small
                        style={{
                          color: "#94a3b8",
                          marginTop: "8px",
                          display: "block",
                        }}
                      >
                        Your buyer list will populate when supermarkets place
                        orders.
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
                                  <img
                                    className="sm-logo"
                                    src={b.logoUrl}
                                    alt={b.name}
                                  />
                                ) : (
                                  <div className="sm-logo-fallback">
                                    {getInitials(b.name)}
                                  </div>
                                )}
                                <div className="sm-name">
                                  <div className="sm-title">
                                    {b.name || "Unknown"}
                                  </div>
                                  <div className="sm-sub">
                                    {b.district || ""}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td>{b.district || "-"}</td>
                            <td className="truncate">
                              {b.contactEmail || "-"}
                            </td>
                            <td>
                              {Number(b.totalOrders || 0).toLocaleString()}
                            </td>
                            <td>{money(b.totalRevenue || 0)}</td>
                            <td>
                              <button
                                className="view-btn"
                                onClick={() => {
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
                          onClick={() =>
                            setPage((p) => Math.min(totalPages, p + 1))
                          }
                        >
                          Next ›
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* RIGHT: Map + Chart */}
            <div className="buyers-right">
              {/* NEW: Leaflet Map card */}
              <div className="chart-card">
                <div className="chart-title">Buyer Districts (Sri Lanka)</div>

                {buyers.length === 0 ? (
                  <div className="buyers-empty">
                    <p>No district data yet.</p>
                  </div>
                ) : (
                  <>
                    <SriLankaLeafletMap
                      height={Math.min(620, window.innerHeight * 0.6)}
                      districtStats={districtStats}
                      selectedDistrict={district}
                      onSelectDistrict={(clickedDistrictName) => {
                        // convert clicked district to canonical district from buyer list if possible
                        const key = safeLower(clickedDistrictName);
                        const canonical =
                          districtCanonicalMap[key] || clickedDistrictName;
                        setDistrict(canonical);
                      }}
                    />

                    <p style={{ marginTop: 8, fontSize: 12, color: "#64748b" }}>
                      Click a district to filter the table.
                    </p>

                    {/* quick reset button */}
                    {district !== "all" && (
                      <button
                        className="pg-btn"
                        style={{ marginTop: 10 }}
                        onClick={() => setDistrict("all")}
                      >
                        Clear Filter
                      </button>
                    )}
                  </>
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
