import React, { useEffect, useMemo, useState } from "react";
import SupplierSidebar from "../Suppliersidebar";
import SupplierTopbar from "../SupplierTopbar";
import axios from "../../../api/axiosInstance";
import "./SupplierOrders.css";

// -------------------- helpers --------------------
const toUiStatus = (s) => {
  const val = (s || "").toLowerCase();
  if (val === "pending") return "Pending";
  if (val === "approved" || val === "accepted") return "Accepted";
  if (val === "rejected") return "Rejected";
  if (val === "dispatched" || val === "shipped") return "Dispatched";
  if (val === "delivered") return "Delivered";
  return "Pending";
};

const normalizeOrder = (o) => {
  const items = Array.isArray(o?.items) ? o.items : [];
  const itemCount = items.reduce(
    (sum, it) => sum + Number(it?.qty || it?.quantity || 0),
    0
  );

  return {
    _rawId: o?._id,
    id: o?._id ? `ORD-${String(o._id).slice(-6).toUpperCase()}` : "ORD-XXXX",
    customer: o?.supermarket?.name || "Unknown Store",
    email: o?.supermarket?.email || "-",
    date: o?.createdAt
      ? new Date(o.createdAt).toLocaleDateString("en-GB")
      : "",
    itemCount,
    total: Number(o?.totalAmount || 0),
    status: toUiStatus(o?.status),
    paymentMethod: o?.paymentMethod || "Credit",
    items,
    createdAt: o?.createdAt,
  };
};

// -------------------- component --------------------
const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  // fetch orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setErrorMsg("");
        const res = await axios.get("/orders/supplier");
        const list = Array.isArray(res.data) ? res.data : [];
        setOrders(list.map(normalizeOrder));
      } catch (err) {
        setErrorMsg(err?.response?.data?.message || "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // filters
  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchStatus = activeTab === "All" || o.status === activeTab;
      const matchSearch =
        o.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        o.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [orders, activeTab, searchTerm]);

  const stats = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "Pending").length,
      revenue: orders.reduce((sum, o) => sum + o.total, 0),
    };
  }, [orders]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "badge-pending";
      case "Accepted":
        return "badge-approved";
      case "Dispatched":
        return "badge-out_for_delivery";
      case "Delivered":
        return "badge-delivered";
      case "Rejected":
        return "badge-cancelled";
      default:
        return "";
    }
  };

  const updateStatus = async (order, newStatus) => {
    if (!order?._rawId) return;

    setOrders((prev) =>
      prev.map((o) =>
        o.id === order.id ? { ...o, status: newStatus } : o
      )
    );
    setSelectedOrder((prev) =>
      prev ? { ...prev, status: newStatus } : prev
    );

    const backendStatus =
      newStatus === "Pending"
        ? "pending"
        : newStatus === "Accepted"
        ? "approved"
        : newStatus === "Rejected"
        ? "rejected"
        : newStatus === "Dispatched"
        ? "dispatched"
        : "delivered";

    try {
      await axios.patch(`/orders/${order._rawId}/status`, {
        status: backendStatus,
      });
    } catch (err) {
      alert("Status update failed");
    }
  };

  // -------------------- UI --------------------
  return (
    <div className="supplier-layout">
      <SupplierSidebar />
      <div className="supplier-main-content">
        <SupplierTopbar />

        <div className="orders-page-container">
          {/* header */}
          <div className="orders-header">
            <div>
              <h1 className="page-title">Order Management</h1>
              <p className="page-subtitle">
                Manage and track your incoming orders
              </p>
            </div>

            <div className="header-stats">
              <div className="stat-pill">
                <span className="stat-label">Pending</span>
                <span className="stat-value warning">{stats.pending}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value success">
                  Rs. {(stats.revenue / 1000).toFixed(1)}k
                </span>
              </div>
            </div>
          </div>

          {/* controls */}
          <div className="controls-section">
            <div className="tabs-container">
              {["All", "Pending", "Accepted", "Dispatched", "Delivered", "Rejected"].map(
                (tab) => (
                  <button
                    key={tab}
                    className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab}
                  </button>
                )
              )}
            </div>

            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search order ID or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* table */}
          {loading ? (
            <div className="loading-container">Loading orders...</div>
          ) : errorMsg ? (
            <div className="empty-state">{errorMsg}</div>
          ) : (
            <div className="table-card">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Items</th>
                    <th>Total Amount</th>
                    <th>Status</th>
                    <th className="action-col">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length ? (
                    filteredOrders.map((o) => (
                      <tr key={o.id}>
                        <td>{o.id}</td>
                        <td>
                          <div className="customer-name">{o.customer}</div>
                          <div className="payment-method">{o.paymentMethod}</div>
                        </td>
                        <td>{o.date}</td>
                        <td>{o.itemCount} Items</td>
                        <td>Rs. {o.total.toLocaleString()}</td>
                        <td>
                          <span
                            className={`status-badge ${getStatusClass(o.status)}`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="action-col">
                          <button
                            className="btn-icon"
                            onClick={() => setSelectedOrder(o)}
                          >
                            View →
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-state">
                        No orders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* modal */}
      {selectedOrder && (
        <div
          className="modal-overlay"
          onClick={() => setSelectedOrder(null)}
        >
          <div
            className="order-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>{selectedOrder.id}</h2>
              <button
                className="close-btn"
                onClick={() => setSelectedOrder(null)}
              >
                ×
              </button>
            </div>

            <div className="modal-footer">
              {selectedOrder.status === "Pending" && (
                <>
                  <button
                    className="btn-reject"
                    onClick={() => updateStatus(selectedOrder, "Rejected")}
                  >
                    Reject Order
                  </button>
                  <button
                    className="btn-accept"
                    onClick={() => updateStatus(selectedOrder, "Accepted")}
                  >
                    Accept Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierOrders;
