import React, { useState, useEffect } from "react";
import SupplierSidebar from "../Suppliersidebar";
import SupplierTopbar from "../SupplierTopbar";
import axios from "../../../api/axiosInstance"; // Axios import කරගන්න
import "./SupplierOrders.css";

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Backend එකෙන් Orders ලබා ගැනීම
  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/orders/supplier"); // අපි කලින් හදපු backend route එක
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Order Status Update කිරීම (Accept/Reject)
  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await axios.patch(`/orders/${orderId}/status`, { status: newStatus });
      
      // Update local state to reflect changes immediately
      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      alert(`Order marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  // --- Filter Logic ---
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = activeTab === "All" || order.status === activeTab;
    const customerName = order.supermarket ? order.supermarket.name : "Unknown";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // --- Stats Calculation ---
  const stats = {
    pending: orders.filter((o) => o.status === "Pending").length,
    revenue: orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0),
    totalOrders: orders.length,
  };

  // --- Status Color Logic ---
  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "badge-pending";
      case "Accepted": // Changed from Shipped for consistency
      case "Shipped": return "badge-shipped";
      case "Delivered": return "badge-delivered";
      case "Rejected": // Changed from Cancelled
      case "Cancelled": return "badge-cancelled";
      default: return "";
    }
  };

  // Date formatter
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB");
  };

  return (
    <div className="supplier-layout">
      <SupplierSidebar />
      <div className="supplier-main-content">
        <SupplierTopbar />

        <div className="orders-page-container">
          {/* 1. Header & Stats Section */}
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

          {/* 2. Controls Section */}
          <div className="controls-section">
            <div className="tabs-container">
              {["All", "Pending", "Accepted", "Delivered", "Rejected"].map((tab) => (
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

          {/* 3. Orders Table */}
          <div className="table-card">
            {loading ? (
                <div style={{padding: "20px", textAlign: "center"}}>Loading orders...</div>
            ) : (
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
                    <tr key={order._id} className="order-row">
                      <td className="id-cell">...{order._id.slice(-6)}</td>
                      <td className="customer-cell">
                        <div className="customer-name">
                          {order.supermarket ? order.supermarket.name : "Unknown Store"}
                        </div>
                        <div className="payment-method">{order.paymentMethod || "Credit"}</div>
                      </td>
                      <td>{formatDate(order.createdAt)}</td>
                      <td>{order.items.length} Items</td>
                      <td className="amount-cell">
                        Rs. {(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="action-col">
                        <button
                          className="btn-icon"
                          onClick={() => setSelectedOrder(order)}
                          title="View Details"
                        >
                          View &rarr;
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
            )}
          </div>
        </div>
      </div>

      {/* 4. Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>Order #{selectedOrder._id.slice(-6)}</h2>
                <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>
                  {selectedOrder.status}
                </span>
              </div>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="customer-section">
                <h3>Customer Details</h3>
                <p>
                  <strong>Store:</strong> {selectedOrder.supermarket ? selectedOrder.supermarket.name : "Unknown"}
                </p>
                <p>
                    <strong>Email:</strong> {selectedOrder.supermarket ? selectedOrder.supermarket.email : "-"}
                </p>
                <p>
                  <strong>Date:</strong> {formatDate(selectedOrder.createdAt)}
                </p>
              </div>

              <h3>Order Items</h3>
              <div className="modal-table-wrapper">
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
                        <td>{item.name || "Product Name"}</td>
                        <td className="text-right">{item.quantity || item.qty}</td>
                        <td className="text-right">{item.price}</td>
                        <td className="text-right">
                          {((item.quantity || 0) * (item.price || 0)).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="order-total">
                <span>Total Amount:</span>
                <span className="total-price">
                  Rs. {(selectedOrder.totalAmount || 0).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="modal-footer">
              {/* Only show Action buttons if Pending */}
              {selectedOrder.status === "Pending" ? (
                <>
                  <button 
                    className="btn-reject"
                    onClick={() => handleStatusUpdate(selectedOrder._id, "Rejected")}
                  >
                    Reject Order
                  </button>
                  <button 
                    className="btn-accept"
                    onClick={() => handleStatusUpdate(selectedOrder._id, "Accepted")}
                  >
                    Accept Order
                  </button>
                </>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupplierOrders;