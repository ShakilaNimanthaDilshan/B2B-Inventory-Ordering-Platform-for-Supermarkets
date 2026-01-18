import React, { useState, useEffect } from "react";
// ✅ FIXED PATHS HERE:
import SupplierSidebar from "../Suppliersidebar"; 
import SupplierTopbar from "../SupplierTopbar";

import axios from "../../../api/axiosInstance";
import { generateInvoice } from "../../../utils/invoiceGenerator"; 

import "./SupplierOrders.css";

const SupplierOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("All");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/orders/supplier");
      setOrders(response.data);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log(`Updating Order: ${orderId} to ${newStatus}`);
      
      const response = await axios.patch(`/orders/${orderId}/status`, { status: newStatus });
      console.log("Update success:", response.data);

      setOrders(orders.map(order => 
        order._id === orderId ? { ...order, status: newStatus } : order
      ));
      
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder({ ...selectedOrder, status: newStatus });
      }
      
      alert(`Order marked as ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error.response?.data || error);
      alert(error.response?.data?.message || "Failed to update status");
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = activeTab === "All" || order.status === activeTab;
    const customerName = order.supermarket ? order.supermarket.name : "Unknown";
    const matchesSearch =
      customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending": return "badge-pending";
      case "Accepted": return "badge-shipped"; 
      case "Shipped": return "badge-shipped";
      case "Delivered": return "badge-delivered";
      case "Rejected": return "badge-cancelled";
      default: return "";
    }
  };

  const getPaymentBadge = (status) => {
    if (status === "Paid") {
        return <span style={{backgroundColor: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600'}}>PAID ✅</span>
    } else {
        return <span style={{backgroundColor: '#fef9c3', color: '#854d0e', padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '600'}}>PENDING ⏳</span>
    }
  };

  return (
    <div className="supplier-layout">
      <SupplierSidebar />
      <div className="supplier-main-content">
        <SupplierTopbar />
        <div className="orders-page-container">
          
          <div className="orders-header">
            <h1 className="page-title">Order Management</h1>
          </div>

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
            {/* Search Input */}
            <div className="search-wrapper">
                <input 
                    type="text" 
                    placeholder="Search by ID or Customer..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
          </div>

          <div className="table-card">
            {loading ? (
                <div style={{padding: "20px", textAlign: "center"}}>Loading...</div>
            ) : (
            <table className="orders-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id}>
                      <td className="id-cell">...{order._id.slice(-6)}</td>
                      <td>{order.supermarket?.name}</td>
                      <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                      <td>Rs. {order.totalAmount.toLocaleString()}</td>
                      <td>{getPaymentBadge(order.paymentStatus)}</td>
                      <td>
                        <span className={`status-badge ${getStatusClass(order.status)}`}>
                          {order.status}
                        </span>
                      </td>
                      <td>
                        <button className="btn-icon" onClick={() => setSelectedOrder(order)}>View</button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="empty-state">No orders found</td></tr>
                )}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </div>

      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="order-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Order #{selectedOrder._id.slice(-6)}</h2>
              <div style={{display:'flex', gap:'10px'}}>
                  <button 
                    className="btn-secondary" 
                    onClick={() => generateInvoice(selectedOrder)}
                    style={{background: '#4f46e5', color: '#fff', border: 'none', display:'flex', alignItems:'center', gap:'5px'}}
                  >
                    <span>📄</span> Invoice
                  </button>
                  <button className="close-btn" onClick={() => setSelectedOrder(null)}>×</button>
              </div>
            </div>

            <div className="modal-body">
              <div style={{display:'flex', justifyContent:'space-between', marginBottom:'20px'}}>
                  <div>
                    <p style={{margin:'5px 0', fontSize:'14px', color:'#666'}}>Customer</p>
                    <p style={{fontWeight:'bold', margin:0}}>{selectedOrder.supermarket?.name}</p>
                    <p style={{margin:0, fontSize:'13px'}}>{selectedOrder.supermarket?.email}</p>
                  </div>
                  <div style={{textAlign:'right'}}>
                    <p style={{margin:'5px 0', fontSize:'14px', color:'#666'}}>Delivery To</p>
                    <p style={{fontWeight:'bold', margin:0}}>{selectedOrder.deliveryAddress}</p>
                  </div>
              </div>
              
              <h3>Items</h3>
              <div className="modal-table-wrapper">
                <table className="modal-table">
                    <thead>
                        <tr><th>Item</th><th style={{textAlign:'right'}}>Qty</th><th style={{textAlign:'right'}}>Total</th></tr>
                    </thead>
                    <tbody>
                        {selectedOrder.items.map((item, i) => (
                            <tr key={i}>
                                <td>{item.name}</td>
                                <td style={{textAlign:'right'}}>{item.quantity}</td>
                                <td style={{textAlign:'right'}}>{(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
              </div>
              <div style={{textAlign:'right', marginTop:'15px', fontSize:'18px', fontWeight:'bold'}}>
                  Total: Rs. {selectedOrder.totalAmount.toLocaleString()}
              </div>
            </div>

            <div className="modal-footer">
              {selectedOrder.status === "Pending" && (
                <>
                  <button className="btn-reject" onClick={() => handleStatusUpdate(selectedOrder._id, "Rejected")}>Reject</button>
                  <button className="btn-accept" onClick={() => handleStatusUpdate(selectedOrder._id, "Accepted")}>Accept Order</button>
                </>
              )}
              {selectedOrder.status === "Accepted" && (
                <button className="btn-accept" onClick={() => handleStatusUpdate(selectedOrder._id, "Shipped")}>Mark as Shipped</button>
              )}
              {selectedOrder.status === "Shipped" && (
                <button className="btn-accept" onClick={() => handleStatusUpdate(selectedOrder._id, "Delivered")}>Mark as Delivered</button>
              )}
              {["Delivered", "Rejected", "Cancelled"].includes(selectedOrder.status) && (
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