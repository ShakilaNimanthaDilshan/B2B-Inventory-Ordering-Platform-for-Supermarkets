// frontend/src/pages/ContactPage.jsx
import React from "react";
import "./ContactPage.css";

const ContactPage = () => {
  return (
    <div className="contact-container">
      <h1>Contact Us</h1>

      <p className="contact-intro">
        Have questions or need support? Get in touch with the BridgeMart team.
      </p>

      <div className="contact-content">
        {/* Contact Info */}
        <div className="contact-info">
          <h3>Contact Information</h3>
          <p><strong>Email:</strong> support@bridgemart.com</p>
          <p><strong>Phone:</strong> +94 77 123 4567</p>
          <p><strong>Address:</strong> Colombo, Sri Lanka</p>
        </div>

        {/* Contact Form */}
        <div className="contact-form">
          <h3>Send a Message</h3>

          <form>
            <input type="text" placeholder="Your Name" required />
            <input type="email" placeholder="Your Email" required />
            <textarea placeholder="Your Message" rows="4" required></textarea>
            <button type="submit">Send Message</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
