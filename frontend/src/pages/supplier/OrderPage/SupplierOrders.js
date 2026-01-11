import React, { useEffect, useMemo, useState } from "react";
import SupplierSidebar from "../Suppliersidebar";
import SupplierTopbar from "../SupplierTopbar";
import axios from "../../../api/axiosInstance";
import "./SupplierOrders.css";

const toUiStatus = (s) => {
  const val = (s || "").toLowerCase();
  if (val === "pending") return "Pending";
  if (val === "approved") return "Approved";
  if (val === "rejected") return "Rejected";
  if (val === "dispatched" || val === "shipped") return "Dispatched";
  if (val === "delivered") return "Delivered";
  return "Pending";
};

const normalizeOrder = (o) => {
  const customerName = o?.supermarket?.name || "Unknown Customer";

  const payment =
    o?.paymentMethod === "credit"
      ? "Credit (30 Days)"
      : o?.paymentMethod === "cod"
      ? "Cash on Delivery"
      : o?.paymentMethod === "bank"
      ? "Bank Transfer"
      : o?.paymentMethod || "—";

  const items = Array.isArray(o?.items)
    ? o.items.map((it) => ({
        name: it?.name || it?.product?.name || "Product",
        qty: Number(it?.qty || 0),
        price: Number(it?.price || 0),
      }))
    : [];

  const itemCount = items.reduce((sum, it) => sum + (it.qty || 0), 0);

  const id = o?._id ? `ORD-${String(o._id).slice(-6).toUpperCase()}` : "ORD-XXXX";
  const dateStr = o?.createdAt;
  const date = dateStr ? new Date(dateStr).toISOString().slice(0, 10) : "";

  return {
    id,
    customer: customerName,
    date,
    itemCount,
    total: Number(o?.totalAmount ?? 0),
    status: toUiStatus(o?.status),
    paymentMethod: payment,
    items,
    _rawId: o?._id,
  };
};

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

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

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesStatus = activeTab === "All" || order.status === activeTab;
      const matchesSearch =
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.id.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [orders, activeTab, searchTerm]);

  const stats = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "Pending").length,
      revenue: orders.reduce((acc, curr) => acc + (curr.total || 0), 0),
    };
  }, [orders]);

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "badge-pending";
      case "Dispatched": return "badge-out_for_delivery";
      case "Delivered": return "badge-delivered";
      case "Rejected": return "badge-cancelled";
      case "Approved": return "badge-approved";
      default: return "";
    }
  };

  const updateStatus = async (order, newStatus) => {
    if (!order._rawId) return;

    // optimistic UI
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
    );
    setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));

    const backendStatus =
      newStatus === "Pending" ? "pending" :
      newStatus === "Approved" ? "approved" :
      newStatus === "Rejected" ? "rejected" :
      newStatus === "Dispatched" ? "dispatched" :
      newStatus === "Delivered" ? "delivered" : "pending";

    try {
      await axios.patch(`/orders/${order._rawId}/status`, { status: backendStatus });
    } catch (err) {
      alert(err?.response?.data?.message || "Status update failed");
    }
  };

  return (
    <div className="supplier-layout">
      <SupplierSidebar />
      <div className="supplier-main-content">
        <SupplierTopbar />

        <div className="orders-page-container">
          <div className="orders-header">
            <div>
              <h1 className="page-title">Order Management</h1>
              <p className="page-subtitle">Manage and track your incoming orders</p>
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

          <div className="controls-section">
            <div className="tabs-container">
              {["All", "Pending", "Dispatched", "Delivered"].map((tab) => (
                <button
                  key={tab}
                  className={`tab-btn ${activeTab === tab ? "active" : ""}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab}
                </button>
              ))}
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

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading orders...</p>
            </div>
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
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order) => (
                      <tr key={order.id} className="order-row">
                        <td className="id-cell">{order.id}</td>
                        <td className="customer-cell">
                          <div className="customer-name">{order.customer}</div>
                          <div className="payment-method">{order.paymentMethod}</div>
                        </td>
                        <td>{order.date}</td>
                        <td>{order.itemCount} Items</td>
                        <td className="amount-cell">Rs. {order.total.toLocaleString()}</td>
                        <td>
                          <span className={`status-badge ${getStatusClass(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="action-col">
                          <button className="btn-icon" onClick={() => setSelectedOrder(order)}>
                            View →
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="empty-state">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedOrder.id}</h2>
                <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>

            <div className="modal-body">
              <h3>Customer Details</h3>
              <p><strong>Store:</strong> {selectedOrder.customer}</p>
              <p><strong>Date:</strong> {selectedOrder.date}</p>
              <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>

              <h3>Order Items</h3>
              <table className="modal-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{item.name}</td>
                      <td className="text-right">{item.qty}</td>
                      <td className="text-right">{item.price}</td>
                      <td className="text-right">{(item.qty * item.price).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="order-total">
                <span>Total Amount:</span>
                <span className="total-price">Rs. {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="modal-footer">
              {selectedOrder.status === "Pending" ? (
                <>
                  <button className="btn-reject" onClick={() => updateStatus(selectedOrder, "Rejected")}>
                    Reject Order
                  </button>
                  <button className="btn-accept" onClick={() => updateStatus(selectedOrder, "Approved")}>
                    Accept Order
                  </button>
                </>
              ) : (
                <button className="btn-secondary" onClick={() => setSelectedOrder(null)}>Close</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierOrders;
