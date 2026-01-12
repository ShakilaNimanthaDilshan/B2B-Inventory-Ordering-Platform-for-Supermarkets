// frontend/src/pages/SupermarketDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE_URL || ""; // e.g. http://localhost:5000

async function safeJson(res) {
  const text = await res.text();
  if (!text) return {};
  if (text.trim().startsWith("<!DOCTYPE") || text.trim().startsWith("<html")) {
    return { message: text };
  }
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

function formatMoney(v) {
  const n = Number(v || 0);
  return `Rs. ${n.toFixed(2)}`;
}

export default function SupermarketDashboard() {
  // auth
  const token =
    localStorage.getItem("token") ||
    localStorage.getItem("authToken") ||
    localStorage.getItem("accessToken") ||
    "";

  const authHeaders = useMemo(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  // ui
  const [tab, setTab] = useState("products"); // products | cart | orders | profile
  const [q, setQ] = useState("");
  const [err, setErr] = useState("");
  const [toast, setToast] = useState(""); // success/info toast

  // data
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [products, setProducts] = useState([]);

  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orders, setOrders] = useState([]);

  const [loadingMe, setLoadingMe] = useState(true);
  const [me, setMe] = useState(null);

  // cart
  const [cart, setCart] = useState([]); // { product, qty }
  const [placing, setPlacing] = useState(false);

  // checkout
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash"); // cash | card | bank
  const [orderNote, setOrderNote] = useState("");

  // toast auto-hide
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  // ---------- API ----------
  const loadProducts = async () => {
    try {
      setErr("");
      setLoadingProducts(true);
      const res = await fetch(`${API_BASE}/api/products`, { headers: authHeaders });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || "Failed to load products");
      setProducts(Array.isArray(data) ? data : data.products || []);
    } catch (e) {
      setErr(e.message || "Products load failed");
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadOrders = async () => {
    try {
      setErr("");
      setLoadingOrders(true);
      const res = await fetch(`${API_BASE}/api/orders`, { headers: authHeaders });
      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || "Failed to load orders");
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (e) {
      setErr(e.message || "Orders load failed");
    } finally {
      setLoadingOrders(false);
    }
  };

  const fetchMeProfile = async () => {
    const candidates = [`${API_BASE}/api/supermarket/me`, `${API_BASE}/api/auth/me`];
    for (const url of candidates) {
      try {
        const res = await fetch(url, { headers: authHeaders });
        const data = await safeJson(res);
        if (res.ok && data) return data;
      } catch {
        // try next
      }
    }
    throw new Error("Cannot load profile (no working /me endpoint).");
  };

  const loadMe = async () => {
    try {
      setErr("");
      setLoadingMe(true);
      const profile = await fetchMeProfile();
      setMe(profile);
    } catch (e) {
      setErr(e.message || "Profile load failed");
    } finally {
      setLoadingMe(false);
    }
  };

  useEffect(() => {
    loadMe();
    loadProducts();
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- UI helpers ----------
  const filteredProducts = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();
      const category = (p.category || "").toLowerCase();
      return name.includes(s) || desc.includes(s) || category.includes(s);
    });
  }, [products, q]);

  const getProductSupplierId = (p) =>
    p?.supplier_id || p?.supplierId || p?.supplier?._id || p?.supplier || null;

  const cartSupplierId = useMemo(() => {
    if (cart.length === 0) return null;
    return getProductSupplierId(cart[0].product);
  }, [cart]);

  const cartTotal = useMemo(() => {
    return cart.reduce(
      (sum, x) => sum + Number(x.product?.price || 0) * Number(x.qty || 0),
      0
    );
  }, [cart]);

  const cartItemsCount = useMemo(() => cart.reduce((n, x) => n + Number(x.qty || 0), 0), [cart]);

  const stats = useMemo(() => {
    const pending = orders.filter((o) => String(o.status || "").toLowerCase().includes("pending"))
      .length;
    return {
      products: products.length,
      cartItems: cartItemsCount,
      orders: orders.length,
      pendingOrders: pending,
      total: cartTotal,
    };
  }, [products.length, cartItemsCount, orders, cartTotal]);

  // ---------- Cart actions ----------
  const addToCart = (product) => {
    setErr("");

    const supplierId = getProductSupplierId(product);
    if (!supplierId) {
      setErr("This product has no supplier info. Add supplier_id to product in DB.");
      return;
    }

    // enforce single supplier per order
    if (cartSupplierId && supplierId !== cartSupplierId) {
      setErr("Cart can contain products from ONE supplier only. Clear cart to switch supplier.");
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex((x) => x.product?._id === product?._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: Math.min(999, copy[idx].qty + 1) };
        return copy;
      }
      return [...prev, { product, qty: 1 }];
    });

    setToast("Added to cart ✅");
  };

  const updateQty = (productId, qty) => {
    const n = Number(qty);
    if (!Number.isFinite(n)) return;
    setCart((prev) =>
      prev
        .map((x) => (x.product?._id === productId ? { ...x, qty: Math.max(0, n) } : x))
        .filter((x) => x.qty > 0)
    );
  };

  const incQty = (productId) => {
    setCart((prev) =>
      prev.map((x) =>
        x.product?._id === productId ? { ...x, qty: Math.min(999, x.qty + 1) } : x
      )
    );
  };

  const decQty = (productId) => {
    setCart((prev) =>
      prev
        .map((x) =>
          x.product?._id === productId ? { ...x, qty: Math.max(0, x.qty - 1) } : x
        )
        .filter((x) => x.qty > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setCheckoutOpen(false);
    setDeliveryAddress("");
    setDeliveryDate("");
    setPaymentMethod("cash");
    setOrderNote("");
    setToast("Cart cleared 🧹");
  };

  const placeOrder = async (extra = {}) => {
    setErr("");
    if (cart.length === 0) {
      setErr("Cart is empty.");
      setTab("products");
      return;
    }

    const supplierId = cartSupplierId;
    if (!supplierId) {
      setErr("Cannot place order: supplier not found for cart items.");
      return;
    }

    try {
      setPlacing(true);

      const payload = {
        supplier_id: supplierId,
        items: cart.map((x) => ({
          product_id: x.product._id,
          qty: x.qty,
          price: x.product.price,
        })),

        // checkout details (backend supports => stored, else ignored)
        delivery_address: extra.delivery_address || "",
        delivery_date: extra.delivery_date || "",
        payment_method: extra.payment_method || "cash",
        note: extra.note || "",
        total_amount: cartTotal,
      };

      const res = await fetch(`${API_BASE}/api/orders`, {
        method: "POST",
        headers: authHeaders,
        body: JSON.stringify(payload),
      });

      const data = await safeJson(res);
      if (!res.ok) throw new Error(data.message || "Order failed");

      setToast("Order placed successfully 🎉");
      clearCart();
      setTab("orders");
      await loadOrders();
    } catch (e) {
      setErr(e.message || "Place order failed");
    } finally {
      setPlacing(false);
    }
  };

  // ---------- Render ----------
  return (
    <div className="dash">
      <style>{css}</style>

      {/* Top header */}
      <div className="topbar">
        <div className="brand">
          <div className="logo">🛒</div>
          <div>
            <div className="title">Supermarket Dashboard</div>
            <div className="subtitle">
              {me?.name ? (
                <>
                  Welcome, <b>{me.name}</b> • {me?.email || ""}
                </>
              ) : (
                "Browse products → add to cart → checkout"
              )}
            </div>
          </div>
        </div>

        <div className="actions">
          <div className="pill">
            <span className="muted">Cart</span> <b>{stats.cartItems}</b>
            <span className="muted">• Total</span> <b>{formatMoney(stats.total)}</b>
          </div>

          <button
            className="btn ghost"
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("authToken");
              localStorage.removeItem("accessToken");
              window.location.reload();
            }}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "products" ? "active" : ""}`} onClick={() => setTab("products")}>
          Products
        </button>
        <button className={`tab ${tab === "cart" ? "active" : ""}`} onClick={() => setTab("cart")}>
          Cart <span className="count">{cart.length}</span>
        </button>
        <button className={`tab ${tab === "orders" ? "active" : ""}`} onClick={() => setTab("orders")}>
          Orders <span className="count">{orders.length}</span>
        </button>
        <button className={`tab ${tab === "profile" ? "active" : ""}`} onClick={() => setTab("profile")}>
          Profile
        </button>
      </div>

      {/* Alerts */}
      {err ? (
        <div className="alert error">
          <b>⚠️</b> <span>{err}</span>
        </div>
      ) : null}

      {toast ? (
        <div className="toast">
          {toast}
        </div>
      ) : null}

      {/* Stats row */}
      <div className="stats">
        <div className="stat">
          <div className="statLabel">Products</div>
          <div className="statValue">{stats.products}</div>
        </div>
        <div className="stat">
          <div className="statLabel">Cart Items</div>
          <div className="statValue">{stats.cartItems}</div>
        </div>
        <div className="stat">
          <div className="statLabel">Orders</div>
          <div className="statValue">{stats.orders}</div>
        </div>
        <div className="stat">
          <div className="statLabel">Pending</div>
          <div className="statValue">{stats.pendingOrders}</div>
        </div>
      </div>

      {/* Content */}
      {tab === "products" && (
        <div className="card">
          <div className="cardTop">
            <div className="searchWrap">
              <input
                className="input"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search products (name / category / description)…"
              />
              {q ? (
                <button className="btn small ghost" onClick={() => setQ("")} title="Clear search">
                  ✕
                </button>
              ) : null}
            </div>

            <div className="row">
              <button className="btn ghost" onClick={loadProducts}>
                Refresh
              </button>
              <button className="btn" onClick={() => setTab("cart")} disabled={cart.length === 0}>
                Go to Cart
              </button>
            </div>
          </div>

          {loadingProducts ? (
            <div className="skeletonGrid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div className="skeletonCard" key={i} />
              ))}
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty">
              <div className="emptyIcon">🔎</div>
              <div className="emptyTitle">No products found</div>
              <div className="emptyText">Try a different keyword or refresh.</div>
              <button className="btn ghost" onClick={loadProducts}>
                Refresh
              </button>
            </div>
          ) : (
            <div className="grid">
              {filteredProducts.map((p) => {
                const supplierId = getProductSupplierId(p);
                return (
                  <div className="pCard" key={p._id}>
                    <div className="pTop">
                      <div className="pName" title={p.name}>
                        {p.name}
                      </div>
                      <div className="price">{formatMoney(p.price)}</div>
                    </div>

                    <div className="pMeta">
                      <span className="chip">{p.category || "General"}</span>
                      <span className="chip mono" title="Supplier ID">
                        {supplierId ? String(supplierId) : "No supplier"}
                      </span>
                    </div>

                    {p.description ? <div className="pDesc">{p.description}</div> : <div className="pDesc muted">No description</div>}

                    <div className="pActions">
                      <button className="btn" onClick={() => addToCart(p)} disabled={!supplierId}>
                        Add
                      </button>
                      <button
                        className="btn ghost"
                        onClick={() => {
                          addToCart(p);
                          setTab("cart");
                        }}
                        disabled={!supplierId}
                      >
                        Add & Cart
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {tab === "cart" && (
        <div className="card">
          <div className="cardTop">
            <div>
              <div className="cardTitle">Cart</div>
              <div className="muted small">
                Supplier:{" "}
                <span className="mono">
                  {cartSupplierId ? String(cartSupplierId) : "—"}
                </span>
              </div>
            </div>

            <div className="row">
              <button className="btn ghost" onClick={clearCart} disabled={cart.length === 0}>
                Clear
              </button>
              <button
                className="btn"
                onClick={() => setCheckoutOpen(true)}
                disabled={cart.length === 0 || placing}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>

          {cart.length === 0 ? (
            <div className="empty">
              <div className="emptyIcon">🧺</div>
              <div className="emptyTitle">Your cart is empty</div>
              <div className="emptyText">Go to products and add items.</div>
              <button className="btn" onClick={() => setTab("products")}>
                Browse Products
              </button>
            </div>
          ) : (
            <>
              <div className="tableWrap">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="right">Price</th>
                      <th className="center">Qty</th>
                      <th className="right">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((x) => (
                      <tr key={x.product._id}>
                        <td>
                          <div className="strong">{x.product.name}</div>
                          <div className="muted small mono">
                            Supplier: {String(getProductSupplierId(x.product) || "—")}
                          </div>
                        </td>
                        <td className="right">{formatMoney(x.product.price)}</td>
                        <td className="center">
                          <div className="qtyWrap">
                            <button className="qtyBtn" onClick={() => decQty(x.product._id)} title="Decrease">
                              −
                            </button>
                            <input
                              className="qtyInput"
                              type="number"
                              min={0}
                              value={x.qty}
                              onChange={(e) => updateQty(x.product._id, Number(e.target.value))}
                            />
                            <button className="qtyBtn" onClick={() => incQty(x.product._id)} title="Increase">
                              +
                            </button>
                          </div>
                        </td>
                        <td className="right">
                          {formatMoney(Number(x.product.price || 0) * Number(x.qty || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="totalBar">
                <div className="muted">Total</div>
                <div className="total">{formatMoney(cartTotal)}</div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === "orders" && (
        <div className="card">
          <div className="cardTop">
            <div className="cardTitle">Orders</div>
            <button className="btn ghost" onClick={loadOrders}>
              Refresh
            </button>
          </div>

          {loadingOrders ? (
            <div className="skeletonList">
              {Array.from({ length: 6 }).map((_, i) => (
                <div className="skeletonRow" key={i} />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="empty">
              <div className="emptyIcon">📦</div>
              <div className="emptyTitle">No orders yet</div>
              <div className="emptyText">Place an order from the cart to see it here.</div>
              <button className="btn" onClick={() => setTab("products")}>
                Browse Products
              </button>
            </div>
          ) : (
            <div className="list">
              {orders.map((o) => (
                <div className="order" key={o._id}>
                  <div className="orderTop">
                    <div className="strong">Order #{String(o._id).slice(-6)}</div>
                    <span className={`status ${String(o.status || "PENDING").toLowerCase()}`}>
                      {o.status || "PENDING"}
                    </span>
                  </div>

                  <div className="muted small">
                    Supplier: <span className="mono">{String(o.supplier_id || o.supplier || "—")}</span>
                  </div>

                  <div className="orderMeta">
                    <div>
                      <div className="muted small">Items</div>
                      <div className="strong">{Array.isArray(o.items) ? o.items.length : 0}</div>
                    </div>
                    <div>
                      <div className="muted small">Total</div>
                      <div className="strong">{formatMoney(o.total_amount || o.totalAmount)}</div>
                    </div>
                  </div>

                  {(o.delivery_address || o.deliveryAddress) ? (
                    <div className="muted small">
                      Delivery: {o.delivery_address || o.deliveryAddress}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab === "profile" && (
        <div className="card">
          <div className="cardTop">
            <div className="cardTitle">Profile</div>
            <button className="btn ghost" onClick={loadMe}>
              Refresh
            </button>
          </div>

          {loadingMe ? (
            <div className="skeletonList">
              {Array.from({ length: 4 }).map((_, i) => (
                <div className="skeletonRow" key={i} />
              ))}
            </div>
          ) : !me ? (
            <div className="empty">
              <div className="emptyIcon">👤</div>
              <div className="emptyTitle">No profile data</div>
              <div className="emptyText">Please login again.</div>
            </div>
          ) : (
            <div className="profile">
              <div className="kv">
                <div className="muted small">Name</div>
                <div className="strong">{me.name || "—"}</div>
              </div>
              <div className="kv">
                <div className="muted small">Email</div>
                <div className="strong">{me.email || "—"}</div>
              </div>
              <div className="kv">
                <div className="muted small">Role</div>
                <div className="strong">{me.role || "—"}</div>
              </div>
              <div className="kv">
                <div className="muted small">Approved</div>
                <div className="strong">{String(me.isApproved ?? me.approved ?? "—")}</div>
              </div>

              <div className="raw">
                <div className="muted small">Raw</div>
                <pre>{JSON.stringify(me, null, 2)}</pre>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <div className="modalOverlay" onClick={() => setCheckoutOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modalHead">
              <div>
                <div className="strong">Checkout</div>
                <div className="muted small">
                  Supplier: <span className="mono">{String(cartSupplierId || "—")}</span>
                </div>
              </div>
              <button className="btn small ghost" onClick={() => setCheckoutOpen(false)} title="Close">
                ✕
              </button>
            </div>

            <div className="modalBody">
              <div>
                <div className="muted small">Delivery Address</div>
                <textarea
                  className="textarea"
                  rows={3}
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter delivery address…"
                />
              </div>

              <div className="twoCol">
                <div>
                  <div className="muted small">Delivery Date</div>
                  <input
                    type="date"
                    className="input"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                  />
                </div>

                <div>
                  <div className="muted small">Payment Method</div>
                  <select
                    className="input"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                  >
                    <option value="cash">Cash on Delivery</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="card">Card</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="muted small">Order Note (optional)</div>
                <input
                  className="input"
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  placeholder="Any note…"
                />
              </div>

              <div className="summary">
                <div className="muted">Total</div>
                <div className="strong">{formatMoney(cartTotal)}</div>
              </div>
            </div>

            <div className="modalFoot">
              <button className="btn ghost" onClick={() => setCheckoutOpen(false)}>
                Cancel
              </button>
              <button
                className="btn"
                disabled={placing}
                onClick={() => {
                  setErr("");
                  if (!deliveryAddress.trim()) {
                    setErr("Please enter delivery address.");
                    return;
                  }
                  if (!cartSupplierId) {
                    setErr("Supplier ID missing in cart items.");
                    return;
                  }
                  placeOrder({
                    delivery_address: deliveryAddress,
                    delivery_date: deliveryDate,
                    payment_method: paymentMethod,
                    note: orderNote,
                  });
                }}
              >
                {placing ? "Confirming..." : "Confirm Order"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Modern CSS (hover, responsive)
const css = `
  :root{
    --bg:#0b0f19;
    --panel: rgba(255,255,255,0.06);
    --panel2: rgba(255,255,255,0.08);
    --border: rgba(255,255,255,0.10);
    --text: rgba(255,255,255,0.92);
    --muted: rgba(255,255,255,0.65);
    --shadow: 0 16px 50px rgba(0,0,0,0.35);
    --radius: 18px;
  }

  .dash{
    min-height:100vh;
    padding: 18px;
    color: var(--text);
    background: radial-gradient(1200px 600px at 15% -10%, rgba(99,102,241,0.35), transparent 60%),
                radial-gradient(900px 500px at 85% 0%, rgba(16,185,129,0.25), transparent 60%),
                var(--bg);
    font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial;
  }

  .topbar{
    position: sticky;
    top: 0;
    z-index: 10;
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap: 14px;
    padding: 12px 12px;
    border-radius: var(--radius);
    background: rgba(10,14,24,0.72);
    backdrop-filter: blur(10px);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
  }

  .brand{display:flex; gap:12px; align-items:center}
  .logo{
    width:40px;height:40px;border-radius: 14px;
    display:grid;place-items:center;
    background: rgba(255,255,255,0.10);
    border: 1px solid var(--border);
  }
  .title{font-size:18px;font-weight:900; letter-spacing:0.2px}
  .subtitle{font-size:12px;color:var(--muted); margin-top:2px}

  .actions{display:flex; gap:10px; align-items:center; flex-wrap:wrap}
  .pill{
    padding: 10px 12px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.06);
    font-size: 12px;
    color: var(--text);
    display:flex; gap:8px; align-items:center;
    white-space: nowrap;
  }
  .muted{color: var(--muted)}
  .small{font-size:12px}
  .mono{font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;}

  .tabs{
    display:flex; gap:10px; flex-wrap:wrap;
    margin: 14px 2px 12px;
  }
  .tab{
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.06);
    color: var(--text);
    cursor:pointer;
    font-weight: 800;
    transition: transform .12s ease, background .12s ease;
  }
  .tab:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.10); }
  .tab.active{
    background: rgba(255,255,255,0.16);
    border-color: rgba(255,255,255,0.18);
  }
  .count{
    margin-left: 6px;
    padding: 3px 8px;
    border-radius: 999px;
    background: rgba(255,255,255,0.12);
    border: 1px solid rgba(255,255,255,0.12);
    font-size: 12px;
  }

  .alert{
    margin: 10px 2px;
    padding: 12px 14px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.06);
    display:flex; gap:10px; align-items:flex-start;
  }
  .alert.error{
    border-color: rgba(239,68,68,0.35);
    background: rgba(239,68,68,0.10);
  }

  .toast{
    position: fixed;
    right: 16px;
    bottom: 16px;
    padding: 12px 14px;
    border-radius: 14px;
    border: 1px solid rgba(16,185,129,0.35);
    background: rgba(16,185,129,0.12);
    box-shadow: var(--shadow);
    z-index: 999;
    font-weight: 800;
  }

  .stats{
    display:grid;
    grid-template-columns: repeat(4, minmax(140px,1fr));
    gap: 10px;
    margin: 10px 2px 14px;
  }
  @media (max-width: 900px){
    .stats{grid-template-columns: repeat(2, minmax(140px,1fr));}
  }
  .stat{
    padding: 14px;
    border-radius: var(--radius);
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border);
  }
  .statLabel{font-size:12px;color:var(--muted)}
  .statValue{font-size:20px;font-weight: 900; margin-top:6px}

  .card{
    border-radius: var(--radius);
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border);
    padding: 14px;
    box-shadow: var(--shadow);
  }
  .cardTop{
    display:flex;
    justify-content:space-between;
    align-items:center;
    gap: 10px;
    flex-wrap:wrap;
    margin-bottom: 12px;
  }
  .cardTitle{font-weight: 900; font-size: 16px}
  .row{display:flex; gap:10px; align-items:center; flex-wrap:wrap;}

  .btn{
    padding: 10px 14px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.18);
    background: rgba(255,255,255,0.16);
    color: var(--text);
    cursor:pointer;
    font-weight: 900;
    transition: transform .12s ease, background .12s ease;
  }
  .btn:hover{ transform: translateY(-1px); background: rgba(255,255,255,0.22); }
  .btn:disabled{ opacity: .55; cursor:not-allowed; transform:none; }
  .btn.ghost{
    background: rgba(255,255,255,0.06);
    border: 1px solid var(--border);
  }
  .btn.small{ padding: 8px 10px; border-radius: 12px; font-weight: 900; }

  .searchWrap{
    display:flex;
    gap:8px;
    align-items:center;
    min-width: min(560px, 100%);
    flex: 1 1 360px;
  }
  .input, .textarea{
    width: 100%;
    padding: 10px 12px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.06);
    color: var(--text);
    outline:none;
  }
  .input::placeholder, .textarea::placeholder{ color: rgba(255,255,255,0.45); }
  .textarea{ resize: vertical; font-family: inherit; }

  .grid{
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
  }
  .pCard{
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.06);
    padding: 14px;
    transition: transform .12s ease, background .12s ease;
  }
  .pCard:hover{ transform: translateY(-2px); background: rgba(255,255,255,0.08); }
  .pTop{ display:flex; justify-content:space-between; gap:10px; align-items:flex-start; }
  .pName{ font-weight: 900; font-size: 14px; line-height:1.2; max-width: 70%; }
  .price{ font-weight: 900; opacity: .95; }
  .pMeta{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
  .chip{
    font-size:12px;
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.06);
    color: var(--text);
  }
  .pDesc{ margin-top:10px; font-size:13px; color: var(--muted); min-height: 36px;}
  .pActions{ margin-top: 12px; display:flex; gap:10px; flex-wrap:wrap; }

  .tableWrap{ overflow-x:auto; border-radius: var(--radius); border: 1px solid var(--border); }
  .table{ width:100%; border-collapse: collapse; min-width: 720px; background: rgba(0,0,0,0.15); }
  .table th, .table td{ padding: 12px 12px; border-bottom: 1px solid rgba(255,255,255,0.08); }
  .table th{ color: var(--muted); font-size:12px; text-transform: uppercase; letter-spacing: .06em; }
  .right{text-align:right}
  .center{text-align:center}
  .strong{ font-weight: 900; }
  .qtyWrap{ display:flex; align-items:center; justify-content:center; gap:8px; }
  .qtyBtn{
    width:34px;height:34px;border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.06);
    color: var(--text);
    cursor:pointer;
    font-weight: 900;
  }
  .qtyBtn:hover{ background: rgba(255,255,255,0.10); }
  .qtyInput{
    width: 64px;
    padding: 8px 10px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.06);
    color: var(--text);
    text-align:center;
    outline:none;
  }

  .totalBar{
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid rgba(255,255,255,0.10);
    display:flex;
    justify-content: space-between;
    align-items:center;
  }
  .total{ font-weight: 900; font-size: 18px; }

  .empty{
    padding: 28px 14px;
    display:grid;
    place-items:center;
    text-align:center;
    gap: 6px;
  }
  .emptyIcon{ font-size: 28px; }
  .emptyTitle{ font-weight: 900; font-size: 16px; }
  .emptyText{ color: var(--muted); font-size: 13px; max-width: 520px; }

  .list{ display:grid; gap: 10px; }
  .order{
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.06);
    border-radius: var(--radius);
    padding: 14px;
  }
  .orderTop{ display:flex; justify-content: space-between; gap: 10px; align-items:center; margin-bottom: 6px; }
  .orderMeta{
    display:grid; grid-template-columns: 1fr 1fr; gap: 12px;
    margin-top: 10px;
  }
  .status{
    padding: 6px 10px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.08);
    font-size: 12px;
    font-weight: 900;
  }
  .status.pending{ border-color: rgba(245,158,11,0.35); background: rgba(245,158,11,0.10); }
  .status.completed, .status.delivered{ border-color: rgba(16,185,129,0.35); background: rgba(16,185,129,0.10); }
  .status.cancelled{ border-color: rgba(239,68,68,0.35); background: rgba(239,68,68,0.10); }

  .profile{
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(220px,1fr));
    gap: 10px;
  }
  .kv{
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: rgba(255,255,255,0.06);
    padding: 14px;
  }
  .raw{
    grid-column: 1 / -1;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: rgba(0,0,0,0.18);
    padding: 14px;
  }
  .raw pre{
    margin: 10px 0 0;
    padding: 12px;
    border-radius: 14px;
    background: rgba(0,0,0,0.35);
    overflow:auto;
    max-height: 280px;
    color: rgba(255,255,255,0.9);
  }

  .skeletonGrid{
    display:grid;
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 12px;
  }
  .skeletonCard{
    height: 180px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.10), rgba(255,255,255,0.04));
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
  }
  .skeletonList{ display:grid; gap: 10px; }
  .skeletonRow{
    height: 72px;
    border-radius: var(--radius);
    border: 1px solid var(--border);
    background: linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.10), rgba(255,255,255,0.04));
    background-size: 200% 100%;
    animation: shimmer 1.3s infinite;
  }
  @keyframes shimmer{
    0%{ background-position: 200% 0; }
    100%{ background-position: -200% 0; }
  }

  .modalOverlay{
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.55);
    display:flex;
    align-items:center;
    justify-content:center;
    padding: 16px;
    z-index: 999;
  }
  .modal{
    width: min(640px, 100%);
    border-radius: var(--radius);
    background: rgba(10,14,24,0.92);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    padding: 14px;
    backdrop-filter: blur(10px);
  }
  .modalHead{
    display:flex; justify-content:space-between; align-items:flex-start; gap: 10px;
    padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.10);
  }
  .modalBody{ padding-top: 12px; display:grid; gap: 12px; }
  .twoCol{ display:grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  @media (max-width: 720px){
    .twoCol{ grid-template-columns: 1fr; }
  }
  .summary{
    display:flex; justify-content:space-between; align-items:center;
    padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.10);
  }
  .modalFoot{
    display:flex; justify-content:flex-end; gap: 10px;
    padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.10);
    margin-top: 12px;
  }
`;

