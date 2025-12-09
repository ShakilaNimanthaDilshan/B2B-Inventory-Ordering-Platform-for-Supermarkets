// frontend/src/pages/supplier/AddProduct.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
  });

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const token = localStorage.getItem("token");

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      };

      const form = new FormData();
      form.append("name", formData.name);
      form.append("description", formData.description);
      form.append("price", formData.price);
      form.append("stock", formData.stock);
      form.append("category", formData.category);

      if (image) form.append("image", image);

      await axios.post("/api/products", form, config);

      setSuccess("Product added successfully!");
      setTimeout(() => navigate("/supplier/products"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page">
      <h2 className="admin-header-title">Add New Product</h2>
      <p className="admin-header-subtitle">
        Fill in the details to add a new item to your inventory.
      </p>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}

      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name</label>
          <input
            type="text"
            name="name"
            required
            value={formData.name}
            onChange={handleChange}
            placeholder="Enter product name"
          />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Enter product description"
          ></textarea>
        </div>

        <div className="form-group">
          <label>Price (Rs)</label>
          <input
            type="number"
            name="price"
            required
            value={formData.price}
            onChange={handleChange}
            placeholder="0.00"
          />
        </div>

        <div className="form-group">
          <label>Stock</label>
          <input
            type="number"
            name="stock"
            required
            value={formData.stock}
            onChange={handleChange}
            placeholder="Initial stock count"
          />
        </div>

        <div className="form-group">
          <label>Category</label>
          <input
            type="text"
            name="category"
            value={formData.category}
            onChange={handleChange}
            placeholder="E.g. Drinks, Grocery, Snacks"
          />
        </div>

        <div className="form-group">
          <label>Product Image</label>
          <input type="file" accept="image/*" onChange={handleImageChange} />
        </div>

        <button className="btn btn-primary" type="submit" disabled={loading}>
          {loading ? "Saving..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default AddProduct;
