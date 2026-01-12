// frontend/src/pages/AboutPage.jsx
import React from "react";
import "./AboutPage.css";

const AboutPage = () => {
  return (
    <div className="about-container">
      <h1>About BridgeMart</h1>

      <p className="about-intro">
        BridgeMart is a B2B inventory management system designed to connect
        administrators, suppliers, and supermarkets on a single platform.
      </p>

      <div className="about-sections">
        <div className="about-card">
          <h3>Our Purpose</h3>
          <p>
            To simplify inventory control, improve communication, and reduce
            manual work between businesses.
          </p>
        </div>

        <div className="about-card">
          <h3>Who Uses BridgeMart</h3>
          <p>
            Admins manage users and approvals, suppliers manage products and
            orders, and supermarkets place orders easily.
          </p>
        </div>

        <div className="about-card">
          <h3>Why BridgeMart</h3>
          <p>
            It provides a secure, organized, and efficient way to manage B2B
            inventory operations.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
