import React, { useState } from "react";
import SupplierSidebar from "../Suppliersidebar";
import SupplierTopbar from "../SupplierTopbar";
import "./SupplierOrders.css";

const SupplierOrders = () => {
  
  const [orders, setOrders] = useState([
    {
      id: "ORD-2024-001",
      customer: "Keells Super - Colombo 07",
      date: "2025-12-21",
      itemCount: 15,
      total: 125000.00,
      status: "Pending",
      paymentMethod: "Credit (30 Days)",
      items: [
        { name: "Munchee Biscuits 100g", qty: 50, price: 100 },
        { name: "Samaposha 200g", qty: 200, price: 150 },
      ]
    },
    {
      id: "ORD-2024-002",
      customer: "Cargills Food City - Nugegoda",
      date: "2025-12-20",
      itemCount: 8,
      total: 45000.50,
      status: "Shipped",
      paymentMethod: "Cash on Delivery",
      items: [
        { name: "Fresh Milk 1L", qty: 20, price: 400 },
      ]
    },
    {
      id: "ORD-2024-003",
      customer: "Arpico Super Centre",
      date: "2025-12-18",
      itemCount: 25,
      total: 210000.00,
      status: "Delivered",
      paymentMethod: "Bank Transfer",
      items: [
        { name: "Basmati Rice 5kg", qty: 100, price: 1200 },
      ]
    },
  ]);

  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Filter Logic ---
  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeTab === "All" || order.status === activeTab;
    const matchesSearch = order.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // --- Stats Calculation (UX Feature) ---
  const stats = {
    pending: orders.filter(o => o.status === "Pending").length,
    revenue: orders.reduce((acc, curr) => acc + curr.total, 0),
    totalOrders: orders.length
  };

  // --- Status Color Logic ---
  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "badge-pending";
      case "Shipped": return "badge-shipped";
      case "Delivered": return "badge-delivered";
      case "Cancelled": return "badge-cancelled";
      default: return "";
    }
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
            {/* Quick Stats Cards */}
            <div className="header-stats">
              <div className="stat-pill">
                <span className="stat-label">Pending</span>
                <span className="stat-value warning">{stats.pending}</span>
              </div>
              <div className="stat-pill">
                <span className="stat-label">Total Revenue</span>
                <span className="stat-value success">Rs. {(stats.revenue/1000).toFixed(1)}k</span>
              </div>
            </div>
          </div>

          {/* 2. Controls Section (Search & Tabs) */}
          <div className="controls-section">
            <div className="tabs-container">
              {["All", "Pending", "Shipped", "Delivered"].map((tab) => (
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
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
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
                    <td colSpan="7" className="empty-state">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* 4. Details Modal */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{selectedOrder.id}</h2>
                <span className={`status-badge ${getStatusClass(selectedOrder.status)}`}>{selectedOrder.status}</span>
              </div>
              <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="customer-section">
                <h3>Customer Details</h3>
                <p><strong>Store:</strong> {selectedOrder.customer}</p>
                <p><strong>Date:</strong> {selectedOrder.date}</p>
                <p><strong>Payment:</strong> {selectedOrder.paymentMethod}</p>
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
                        <td>{item.name}</td>
                        <td className="text-right">{item.qty}</td>
                        <td className="text-right">{item.price}</td>
                        <td className="text-right">{(item.qty * item.price).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="order-total">
                <span>Total Amount:</span>
                <span className="total-price">Rs. {selectedOrder.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="modal-footer">
              {/* Only show Action buttons if Pending */}
              {selectedOrder.status === "Pending" ? (
                <>
                  <button className="btn-reject">Reject Order</button>
                  <button className="btn-accept">Accept & Ship</button>
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