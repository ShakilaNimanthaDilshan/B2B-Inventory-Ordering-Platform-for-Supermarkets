// frontend/src/pages/RegisterPage.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";
import "./Auth.css";


const districts = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Matale",
  "Nuwara Eliya",
  "Galle",
  "Matara",
  "Hambantota",
  "Jaffna",
  "Kilinochchi",
  "Mannar",
  "Mullaitivu",
  "Vavuniya",
  "Trincomalee",
  "Batticaloa",
  "Ampara",
  "Kurunegala",
  "Puttalam",
  "Anuradhapura",
  "Polonnaruwa",
  "Badulla",
  "Monaragala",
  "Ratnapura",
  "Kegalle",
];


const RegisterPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "supplier", 
     district: "", // default
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      await api.post("/auth/register", formData);

      setMessage(
        "Registration successful. Your account is pending admin approval."
      );

      // Clear form
      setFormData({
        name: "",
        email: "",
        password: "",
        role: "supplier",
         district: "",
      });

      // ✅ Go to "wait until admin approves" page (NOT admin page)
      navigate("/pending");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-form" onSubmit={onSubmit}>
        <h2>Register</h2>

        {message && <p className="auth-success">{message}</p>}
        {error && <p className="auth-error">{error}</p>}

        <label>Name</label>
        <input
          name="name"
          value={formData.name}
          onChange={onChange}
          required
        />

        <label>Email</label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={onChange}
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={onChange}
          required
        />

        <label>Role</label>
        <select name="role" value={formData.role} onChange={onChange}>
          <option value="supplier">Supplier</option>
          <option value="supermarket">Supermarket</option>
        </select>

        <label>District</label>
<select
  name="district"
  value={formData.district}
  onChange={onChange}
  required
>
  <option value="">Select District</option>
  {districts.map((district) => (
    <option key={district} value={district}>
      {district}
    </option>
  ))}
</select>


        <button type="submit">Register</button>
      </form>
    </div>
  );
};

export default RegisterPage;
