import React from "react";
import "./InfoSection.css";

const InfoSection = () => {
  return (
    <section className="info-section">
      <h2>How BridgeMart Works</h2>
      <p className="info-subtitle">
        A simple B2B platform designed to streamline inventory and business
        operations.
      </p>

      <div className="info-cards">
        <div className="info-card">
          <div className="info-icon">🧩</div>
          <h3>Centralized Management</h3>
          <p>
            Admins control users, approvals, and system operations from one
            secure dashboard.
          </p>
        </div>

        <div className="info-card">
          <div className="info-icon">📦</div>
          <h3>Supplier Operations</h3>
          <p>
            Suppliers manage products, stock levels, and orders efficiently
            with real-time updates.
          </p>
        </div>

        <div className="info-card">
          <div className="info-icon">🛒</div>
          <h3>Supermarket Ordering</h3>
          <p>
            Supermarkets browse products, place orders, and track deliveries
            with ease.
          </p>
        </div>
      </div>
    </section>
  );
};

export default InfoSection;
