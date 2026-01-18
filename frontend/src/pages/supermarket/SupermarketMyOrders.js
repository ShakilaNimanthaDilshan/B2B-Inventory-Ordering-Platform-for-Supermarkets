import React, { useEffect, useState } from "react";
import api from "../../api/axiosInstance"; // Path එක වැරදුනොත් ../ හෝ ../../ දාලා බලන්න
import { generateInvoice } from "../../utils/invoiceGenerator"; 

export default function SupermarketMyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyOrders();
  }, []);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const res = await api.get("/orders/my");
      setOrders(res.data);
    } catch (err) {
      console.error("Error loading orders:", err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
        case "Pending": return "#eab308"; // Yellow
        case "Accepted": return "#3b82f6"; // Blue
        case "Shipped": return "#8b5cf6"; // Purple
        case "Delivered": return "#22c55e"; // Green
        case "Rejected": return "#ef4444"; // Red
        default: return "#6b7280";
    }
  };

  return (
    <div style={{ padding: "30px", background: "#0b1220", minHeight: "100vh", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <h1 style={{ fontSize: "28px", fontWeight: "bold", marginBottom: "30px", borderBottom: "1px solid #374151", paddingBottom: "10px" }}>
        📦 My Orders & Tracking
      </h1>

      {loading ? (
        <div style={{textAlign: "center", color: "#9ca3af"}}>Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div style={{textAlign: "center", padding: "40px", background: "#1f2937", borderRadius: "12px"}}>
            <h3>No orders found yet.</h3>
            <p style={{color: "#9ca3af"}}>Go to Dashboard to place your first order!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "20px" }}>
          {orders.map((order) => (
            <div key={order._id} style={{ 
                background: "#1f2937", 
                padding: "20px", 
                borderRadius: "16px", 
                border: "1px solid #374151",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
            }}>
              
              {/* Header Row */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "15px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                    <div style={{ fontSize: "18px", fontWeight: "bold", color: "#f3f4f6" }}>
                        Order #{order._id.slice(-6)}
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: "13px", marginTop: "4px" }}>
                        Placed on: {new Date(order.createdAt).toLocaleDateString()}
                    </div>
                </div>
                
                <div style={{ textAlign: "right" }}>
                    <div style={{ 
                        background: getStatusColor(order.status),
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        display: "inline-block",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                    }}>
                        {order.status}
                    </div>
                    <div style={{ marginTop: "8px", fontSize: "13px", color: order.paymentStatus === 'Paid' ? '#4ade80' : '#facc15' }}>
                        Payment: {order.paymentStatus}
                    </div>
                </div>
              </div>

              <hr style={{ borderColor: "#374151", marginBottom: "15px" }} />

              {/* Items & Supplier Info */}
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
                
                <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", color: "#9ca3af", marginBottom: "8px" }}>Supplier: <span style={{color: "#fff", fontWeight: "600"}}>{order.supplier?.name || "Unknown"}</span></div>
                    
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {order.items.map((item, i) => (
                            <span key={i} style={{ 
                                background: "#374151", 
                                padding: "4px 10px", 
                                borderRadius: "6px", 
                                fontSize: "13px", 
                                color: "#e5e7eb" 
                            }}>
                                {item.name} <span style={{color: "#9ca3af"}}>x{item.quantity}</span>
                            </span>
                        ))}
                    </div>
                </div>

                <div style={{ textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
                    <div style={{ fontSize: "20px", fontWeight: "bold", color: "#34d399", marginBottom: "10px" }}>
                        Rs. {order.totalAmount.toLocaleString()}
                    </div>
                    
                    <button 
                        onClick={() => generateInvoice(order)}
                        style={{
                            background: "transparent",
                            border: "1px solid #6366f1",
                            color: "#6366f1",
                            padding: "8px 16px",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "13px",
                            fontWeight: "600",
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            justifyContent: "center"
                        }}
                        onMouseOver={(e) => e.target.style.background = "rgba(99, 102, 241, 0.1)"}
                        onMouseOut={(e) => e.target.style.background = "transparent"}
                    >
                        <span>📄</span> Download Invoice
                    </button>
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}