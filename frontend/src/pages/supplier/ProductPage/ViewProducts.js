import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import SupplierSidebar from "../Suppliersidebar";
import SupplierTopbar from "../SupplierTopbar";
import axios from "../../../api/axiosInstance";
import "./ViewProducts.css";

const ViewProducts = () => {
  const location = useLocation();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [file, setFile] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    image: "",
  });

  const [formLoading, setFormLoading] = useState(false);
  const itemsPerPage = 10;
  const BASE_URL = "http://localhost:5000";

  const categories = [
    "Beverages",
    "Dairy",
    "Snacks",
    "Frozen Foods",
    "Canned Goods",
    "Bakery",
    "Meat",
    "Produce",
    "Condiments",
    "Cleaning Supplies",
    "Computers",
    "Electronics",
    "Personal Care",
    "Other",
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    if (location.state && location.state.openAdd) {
      openAddModal();
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/products/my-products");
      setProducts(response.data);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      image: "",
    });
    setFile(null);
    setShowModal(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || "",
      image: product.image || "",
    });
    setFile(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      image: "",
    });
    setFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price);
      formDataToSend.append("stock", formData.stock);
      formDataToSend.append("category", formData.category);

      if (file) {
        formDataToSend.append("image", file);
      } else if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      if (editingProduct) {
        await axios.patch("/products/" + editingProduct._id, formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await axios.post("/products", formDataToSend, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }
      closeModal();
      fetchProducts();
    } catch (error) {
      console.error("Error saving product:", error);
      alert(
        "Error saving product: " +
          (error.response?.data?.message || "Please try again.")
      );
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await axios.delete("/products/" + productId);
        fetchProducts();
      } catch (error) {
        console.error("Error deleting product:", error);
      }
    }
  };

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || product.category === categoryFilter;
    let matchesStatus = true;
    if (statusFilter === "out-of-stock") matchesStatus = product.stock === 0;
    else if (statusFilter === "low-stock")
      matchesStatus = product.stock > 0 && product.stock <= 10;
    else if (statusFilter === "in-stock") matchesStatus = product.stock > 10;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const generateProductId = (index) => `2L${3500 - (startIndex + index) * 100}`;

  // filter clear option
  const clearAllFilters = () => {
    setCategoryFilter("all");
    setStatusFilter("all");
    setSearchTerm("");
    setCurrentPage(1);
  };

  // watch whre we slect in the filter
  const isFilterActive = categoryFilter !== "all" || statusFilter !== "all";

  return (
    <div className="supplier-layout">
      <SupplierSidebar />
      <div className="supplier-main-content">
        <SupplierTopbar />
        <div className="view-products-page">
          <h1 className="page-title">Products</h1>
        

          <div className="products-toolbar">
            <div className="toolbar-left">
              <button
                className={`view-btn ${viewMode === "list" ? "active" : ""}`}
                onClick={() => setViewMode("list")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                List
              </button>
              <button
                className={`view-btn ${viewMode === "grid" ? "active" : ""}`}
                onClick={() => setViewMode("grid")}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                Grid
              </button>
              <div className="filter-dropdown-container">
                <button
                  className="filter-btn"
                  onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                  </svg>
                  Filter
                </button>
                {showFilterDropdown && (
                  <div className="filter-dropdown">
                    <div className="filter-group">
                      <label>Category</label>
                      <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                      >
                        <option value="all">All Categories</option>
                        {categories.map((cat) => (
                          <option key={cat} value={cat}>
                            {cat}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="filter-group">
                      <label>Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                      >
                        <option value="all">All Status</option>
                        <option value="in-stock">In Stock</option>
                        <option value="low-stock">Low Stock</option>
                        <option value="out-of-stock">Out of Stock</option>
                      </select>
                    </div>
                    {/* add Buton for filter dropdown */}
                    <button
                      className="reset-filter-link"
                      onClick={clearAllFilters}
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="toolbar-right">
              <button className="import-btn">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="17 8 12 3 7 8"></polyline>
                  <line x1="12" y1="3" x2="12" y2="15"></line>
                </svg>
                Import
              </button>
              <button className="add-btn" onClick={openAddModal}>
                + Add new product
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading products...</p>
            </div>
          ) : viewMode === "list" ? (
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>ID#</th>
                    <th>Photo</th>
                    <th>Item Name</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Update</th>
                    <th className="action-head">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedProducts.map((product, index) => (
                    <tr key={product._id}>
                      <td className="id-cell" data-label="ID">
                        {generateProductId(index)}
                      </td>
                      <td className="photo-cell" data-label="Photo">
                        <div className="product-photo">
                          {product.image ? (
                            <img
                              src={`${BASE_URL}${product.image}`}
                              alt={product.name}
                            />
                          ) : (
                            <div className="no-image">No Image</div>
                          )}
                        </div>
                      </td>
                      <td className="name-cell" data-label="Item Name">
                        <div className="product-name">{product.name}</div>
                        <div className="product-desc">
                          {product.description}
                        </div>
                      </td>
                      <td className="price-cell" data-label="Price">
                        Rs.{parseFloat(product.price).toFixed(2)}
                      </td>
                      <td className="status-cell" data-label="Status">
                        {(() => {
                          let statusClass = "in-stock";
                          let statusText = "In Stock";
                          if (product.stock === 0) {
                            statusClass = "out-of-stock";
                            statusText = "Out of Stock";
                          } else if (product.stock <= 10) {
                            statusClass = "low-stock";
                            statusText = "Low Stock";
                          }
                          return (
                            <span className={`status-badge ${statusClass}`}>
                              {statusText}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="category-cell" data-label="Category">
                        <span className="category-tag">
                          #{product.category || "Other"}
                        </span>
                      </td>
                      <td className="stock-cell" data-label="Stock">
                        {product.stock}
                      </td>
                      <td className="date-cell" data-label="Update">
                        {formatDate(product.updatedAt || product.createdAt)}
                      </td>

                      {/* --- THIS IS THE UPDATED ACTION CELL --- */}
                      <td className="action-cell" data-label="Action">
                        <div className="action-buttons">
                          {/* View / Info Icon */}
                          <button
                            className="action-btn view"
                            title="View Details"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <circle cx="12" cy="12" r="10"></circle>
                              <line x1="12" y1="16" x2="12" y2="12"></line>
                              <line x1="12" y1="8" x2="12.01" y2="8"></line>
                            </svg>
                          </button>

                          {/* Edit Icon */}
                          <button
                            className="action-btn edit"
                            onClick={() => openEditModal(product)}
                            title="Edit"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                          </button>

                          {/* Delete Icon */}
                          <button
                            className="action-btn delete"
                            onClick={() => handleDelete(product._id)}
                            title="Delete"
                          >
                            <svg
                              width="24"
                              height="24"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <polyline points="3 6 5 6 21 6"></polyline>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                            </svg>
                          </button>
                        </div>
                      </td>
                      {/* ------------------------------------- */}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="empty-state">
                  <p>No products found</p>
                </div>
              )}
            </div>
          ) : (
            /* Grid View Logic remains same but uses new classNames */
            <div className="products-grid">
              {paginatedProducts.map((product) => (
                <div key={product._id} className="product-card">
                  {/* ... Same as your existing Grid Code ... */}
                  <div className="card-image">
                    {product.image ? (
                      <img
                        src={`${BASE_URL}${product.image}`}
                        alt={product.name}
                      />
                    ) : (
                      <div className="no-image">No Image</div>
                    )}
                  </div>
                  <div className="card-content">
                    <h3>{product.name}</h3>
                    <p className="card-price">
                      Rs.{parseFloat(product.price).toFixed(2)}
                    </p>
                    <p className="card-stock">Stock: {product.stock}</p>
                    <div className="card-actions">
                      <button onClick={() => openEditModal(product)}>
                        Edit
                      </button>
                      <button onClick={() => handleDelete(product._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination">
              {/* Pagination logic remains same */}
              <button
                className="page-btn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
              >
                ‹
              </button>
              {/* ... etc ... */}
              <button
                className="page-btn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((prev) => prev + 1)}
              >
                ›
              </button>
            </div>
          )}
        </div>
      </div>
      {/* Modal Code remains same... */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="product-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingProduct ? "Edit Product" : "Add New Product"}</h2>
              <button
                className="modal-close"
                onClick={closeModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "20px",
                  cursor: "pointer",
                }}
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              {/* Form inputs same as before */}
              <div className="form-group">
                <label>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              {/* ... other inputs ... */}
              <div className="form-group">
                <label>Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>Image</label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-submit">
                  {formLoading ? "Saving..." : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewProducts;
