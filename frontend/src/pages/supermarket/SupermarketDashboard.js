import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ Added for navigation
import api from "../../api/axiosInstance"; 

export default function SupermarketDashboard() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [me, setMe] = useState(null);
  const [meLoading, setMeLoading] = useState(true);

  // ✅ UI controls
  const [stockFilter, setStockFilter] = useState("all"); 
  const [sortBy, setSortBy] = useState("newest"); 

  // ✅ CART
  const [cart, setCart] = useState([]); 
  const [qtyByProduct, setQtyByProduct] = useState({}); 

  // ✅ CHECKOUT
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [orderNote, setOrderNote] = useState("");
  const [placing, setPlacing] = useState(false);

  // ✅ PAYMENT STATES
  const [paymentMethod, setPaymentMethod] = useState("Cash"); 
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvc: "",
    name: ""
  });

  const BASE_URL = "http://localhost:5000";

  // --------- LOAD DATA ----------
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        setMeLoading(true);

        const [meRes, prodRes] = await Promise.all([
          api.get("/auth/me"),
          api.get("/products"), 
        ]);

        setMe(meRes.data);
        const list = prodRes.data || [];
        setProducts(list);

        setQtyByProduct((prev) => {
          const next = { ...prev };
          for (const p of list) {
            if (p?._id && next[p._id] == null) next[p._id] = 1;
          }
          return next;
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setMeLoading(false);
      }
    };

    loadAll();
  }, []);

  const fmtLKR = (n) =>
    new Intl.NumberFormat("en-LK", {
      style: "currency",
      currency: "LKR",
      maximumFractionDigits: 0,
    }).format(Number(n || 0));

  const stockBadge = (stock) => {
    const s = Number(stock || 0);
    if (s <= 0) return { text: "Out of stock", bg: "#3b0d0d", bd: "#7f1d1d" };
    if (s <= 10) return { text: "Low stock", bg: "#3b2a0d", bd: "#a16207" };
    return { text: "In stock", bg: "#0f2f1f", bd: "#15803d" };
  };

  // --------- HELPERS ----------
  const getSupplierId = (p) => p?.supplier?._id || p?.supplier || null;

  const cartSupplierId = useMemo(() => {
    if (cart.length === 0) return null;
    return getSupplierId(cart[0].product);
  }, [cart]);

  const cartCount = useMemo(
    () => cart.reduce((sum, x) => sum + Number(x.qty || 0), 0),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (sum, x) =>
          sum + Number(x.product?.price || 0) * Number(x.qty || 0),
        0
      ),
    [cart]
  );

  // ✅ Stats
  const stats = useMemo(() => {
    const total = products.length;
    const out = products.filter((p) => Number(p.stock || 0) <= 0).length;
    const low = products.filter((p) => {
      const s = Number(p.stock || 0);
      return s > 0 && s <= 10;
    }).length;
    const instock = products.filter((p) => Number(p.stock || 0) > 10).length;

    return { total, instock, low, out };
  }, [products]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    let list = [...products];

    if (s) {
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const supplier = (p.supplier?.name || "").toLowerCase();
        return name.includes(s) || category.includes(s) || supplier.includes(s);
      });
    }

    if (stockFilter === "out") {
      list = list.filter((p) => Number(p.stock || 0) <= 0);
    } else if (stockFilter === "low") {
      list = list.filter((p) => {
        const st = Number(p.stock || 0);
        return st > 0 && st <= 10;
      });
    } else if (stockFilter === "in") {
      list = list.filter((p) => Number(p.stock || 0) > 10);
    }

    if (sortBy === "priceAsc") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    } else {
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [products, q, stockFilter, sortBy]);

  // --------- QTY Logic ----------
  const setProductQty = (id, qty) => {
    const n = Number(qty);
    const safe = Number.isFinite(n) ? Math.max(1, Math.min(999, n)) : 1;
    setQtyByProduct((prev) => ({ ...prev, [id]: safe }));
  };
  const incProductQty = (id) =>
    setQtyByProduct((prev) => ({
      ...prev,
      [id]: Math.min(999, Number(prev[id] || 1) + 1),
    }));
  const decProductQty = (id) =>
    setQtyByProduct((prev) => ({
      ...prev,
      [id]: Math.max(1, Number(prev[id] || 1) - 1),
    }));

  // --------- CART actions ----------
  const addToCart = (product) => {
    const stock = Number(product.stock || 0);
    if (stock <= 0) return alert("Out of stock!");

    const supplierId = getSupplierId(product);
    if (!supplierId) return alert("Error: Product has no supplier info.");

    if (cartSupplierId && String(supplierId) !== String(cartSupplierId)) {
      if(!window.confirm("Cart contains items from another supplier. Clear cart and add this item?")) {
        return;
      }
      setCart([{ product, qty: Number(qtyByProduct[product._id] || 1) }]);
      return;
    }

    const addQty = Number(qtyByProduct[product._id] || 1);

    setCart((prev) => {
      const idx = prev.findIndex((x) => x.product?._id === product._id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], qty: Math.min(stock, copy[idx].qty + addQty) }; 
        return copy;
      }
      return [...prev, { product, qty: addQty }];
    });
  };

  const updateCartQty = (productId, qty, maxStock) => {
    const n = Number(qty);
    if (!Number.isFinite(n)) return;
    const validQty = Math.min(Math.max(0, n), maxStock);
    
    setCart((prev) =>
      prev
        .map((x) =>
          x.product?._id === productId ? { ...x, qty: validQty } : x
        )
        .filter((x) => x.qty > 0)
    );
  };

  const clearCart = () => {
    setCart([]);
    setCheckoutOpen(false);
    setDeliveryAddress("");
    setOrderNote("");
    setPaymentMethod("Cash");
    setCardDetails({ number: "", expiry: "", cvc: "", name: "" });
  };

  // --------- PLACE ORDER ----------
  const placeOrder = async () => {
    if (cart.length === 0) return alert("Cart is empty");
    
    const supplierId = cartSupplierId;
    if (!supplierId) return alert("Supplier missing in cart");

    if (!deliveryAddress.trim()) {
      return alert("Please enter delivery address");
    }

    if (paymentMethod === "Card") {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name) {
        return alert("Please enter valid card details");
      }
    }

    const itemsPayload = cart.map((x) => ({
      product: x.product._id,
      name: x.product.name,
      quantity: x.qty,
      price: x.product.price
    }));

    const payload = {
      supplierId: supplierId,
      items: itemsPayload,
      totalAmount: cartTotal,
      deliveryAddress: deliveryAddress,
      note: orderNote,
      paymentMethod: paymentMethod, 
    };

    try {
      setPlacing(true);
      
      if (paymentMethod === "Card") {
        await new Promise(resolve => setTimeout(resolve, 2000)); 
      }

      await api.post("/orders", payload);
      alert(paymentMethod === "Card" ? "✅ Payment Successful! Order Placed." : "✅ Order Placed Successfully!");
      
      clearCart();
    } catch (err) {
      console.error("ORDER ERR:", err);
      alert(err?.response?.data?.message || "Order failed. Please try again.");
    } finally {
      setPlacing(false);
    }
  };

  // --------- UI ----------
  if (loading) {
    return (
      <div style={styles.page}>
        <div style={styles.loadingContainer}>Loading products...</div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Header
        q={q}
        setQ={setQ}
        count={filtered.length}
        me={me}
        meLoading={meLoading}
        cartCount={cartCount}
        onCart={() => setCheckoutOpen(true)}
      />

      <div style={styles.topBar}>
        <div style={styles.statsRow}>
          <StatChip label="Total" value={stats.total} />
          <StatChip label="In Stock" value={stats.instock} />
          <StatChip label="Low" value={stats.low} />
          <StatChip label="Out" value={stats.out} />
        </div>

        <div style={styles.controls}>
          <select value={stockFilter} onChange={(e) => setStockFilter(e.target.value)} style={styles.select}>
            <option value="all">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>

          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={styles.select}>
            <option value="newest">Sort: Newest</option>
            <option value="priceAsc">Sort: Price ↑</option>
            <option value="priceDesc">Sort: Price ↓</option>
            <option value="name">Sort: Name A→Z</option>
          </select>

          <button style={styles.resetBtn} onClick={() => { setQ(""); setStockFilter("all"); setSortBy("newest"); }}>
            Reset
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={styles.emptyWrap}>
          <div style={styles.emptyIcon}>🛒</div>
          <div style={styles.emptyTitle}>No products found</div>
          <div style={styles.emptyText}>This could be because no suppliers in your district ({me?.district}) have added products yet.</div>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((p) => {
            const badge = stockBadge(p.stock);
            const selectedQty = Number(qtyByProduct[p._id] || 1);
            const out = Number(p.stock || 0) <= 0;

            return (
              <div key={p._id} style={styles.card}>
                <div style={styles.imgWrap}>
                  {p.image ? (
                    <img src={`${BASE_URL}${p.image}`} alt={p.name} style={styles.img} onError={(e) => {e.target.style.display='none'; e.target.nextSibling.style.display='grid'}} />
                  ) : null}
                  <div style={{...styles.noImg, display: p.image ? 'none' : 'grid'}}>No Image</div>
                  <div style={{...styles.badge, background: badge.bg, borderColor: badge.bd}}>{badge.text}</div>
                </div>

                <div style={styles.cardBody}>
                  <div style={styles.topRow}>
                    <div style={styles.title} title={p.name}>{p.name}</div>
                    <div style={styles.price}>{fmtLKR(p.price)}</div>
                  </div>

                  <div style={styles.meta}>
                    <div style={styles.metaRow}><span style={styles.metaLabel}>Supplier</span><span style={styles.metaValue}>{p.supplier?.name || "-"}</span></div>
                    <div style={styles.metaRow}><span style={styles.metaLabel}>Category</span><span style={styles.metaValue}>{p.category || "-"}</span></div>
                    <div style={styles.metaRow}><span style={styles.metaLabel}>Stock</span><span style={styles.metaValue}>{p.stock}</span></div>
                  </div>

                  <div style={styles.cartRow}>
                    <div style={styles.qtyWrap}>
                      <button style={styles.qtyBtn} onClick={() => decProductQty(p._id)} disabled={out}>−</button>
                      <input style={styles.qtyInput} type="number" min={1} value={selectedQty} onChange={(e) => setProductQty(p._id, e.target.value)} disabled={out} />
                      <button style={styles.qtyBtn} onClick={() => incProductQty(p._id)} disabled={out}>+</button>
                    </div>
                    <button style={{...styles.addBtn, opacity: out ? 0.6 : 1, cursor: out ? "not-allowed" : "pointer"}} disabled={out} onClick={() => addToCart(p)}>Add</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {checkoutOpen && (
        <div style={styles.modalOverlay} onClick={() => setCheckoutOpen(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHead}>
              <div><div style={{ fontWeight: 900, fontSize: 16 }}>Checkout</div><div style={{ color: "#94a3b8", fontSize: 12 }}>Items: <b>{cartCount}</b> • Total: <b>{fmtLKR(cartTotal)}</b></div></div>
              <button style={styles.modalClose} onClick={() => setCheckoutOpen(false)}>✕</button>
            </div>

            {cart.length === 0 ? (
              <div style={{ color: "#94a3b8", padding: 20, textAlign: 'center' }}>Cart is empty.</div>
            ) : (
              <>
                <div style={styles.cartTable}>
                  {cart.map((x) => (
                    <div key={x.product._id} style={styles.cartItemRow}>
                      <div style={{ flex: 1 }}><div style={{ fontWeight: 800 }}>{x.product.name}</div><div style={{ color: "#94a3b8", fontSize: 12 }}>{fmtLKR(x.product.price)} each</div></div>
                      <input style={styles.cartQty} type="number" min={1} max={x.product.stock} value={x.qty} onChange={(e) => updateCartQty(x.product._id, e.target.value, x.product.stock)} />
                    </div>
                  ))}
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Delivery Address</label>
                  <textarea style={styles.textarea} value={deliveryAddress} onChange={(e) => setDeliveryAddress(e.target.value)} placeholder="Enter delivery address..." />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Note (optional)</label>
                  <input style={styles.input} value={orderNote} onChange={(e) => setOrderNote(e.target.value)} placeholder="Any special instructions..." />
                </div>

                {/* Payment UI */}
                <div style={styles.formGroup}>
                  <label style={styles.label}>Payment Method</label>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <button style={{...styles.payBtn, background: paymentMethod === "Cash" ? "#3b82f6" : "#1f2937", border: paymentMethod === "Cash" ? "1px solid #60a5fa" : "1px solid #374151"}} onClick={() => setPaymentMethod("Cash")}>💵 Cash on Delivery</button>
                    <button style={{...styles.payBtn, background: paymentMethod === "Card" ? "#3b82f6" : "#1f2937", border: paymentMethod === "Card" ? "1px solid #60a5fa" : "1px solid #374151"}} onClick={() => setPaymentMethod("Card")}>💳 Credit / Debit Card</button>
                  </div>
                </div>

                {paymentMethod === "Card" && (
                  <div style={styles.cardForm}>
                    <input style={styles.input} placeholder="Card Number" maxLength={19} value={cardDetails.number} onChange={(e) => setCardDetails({...cardDetails, number: e.target.value})} />
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      <input style={styles.input} placeholder="MM/YY" maxLength={5} value={cardDetails.expiry} onChange={(e) => setCardDetails({...cardDetails, expiry: e.target.value})} />
                      <input style={styles.input} placeholder="CVC" maxLength={3} value={cardDetails.cvc} onChange={(e) => setCardDetails({...cardDetails, cvc: e.target.value})} />
                    </div>
                    <input style={{...styles.input, marginTop: 10}} placeholder="Cardholder Name" value={cardDetails.name} onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})} />
                  </div>
                )}

                <div style={styles.modalFoot}>
                  <button style={styles.resetBtn} onClick={clearCart} disabled={placing}>Clear Cart</button>
                  <button style={{ ...styles.addBtn, padding: "10px 14px" }} onClick={placeOrder} disabled={placing}>
                    {placing ? "Processing..." : "Place Order"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ✅ Updated Header with Navigatio
function Header({ q, setQ, count, me, meLoading, cartCount, onCart }) {
  const navigate = useNavigate(); 

  return (
    <div style={styles.header}>
      <div><div style={styles.hTitle}>Supermarket Dashboard</div><div style={styles.hSub}>Showing <b>{count}</b> products in <b>{me?.district || "your district"}</b></div></div>
      <div style={styles.searchWrap}><span style={styles.searchIcon}>🔍</span><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search products..." style={styles.search} /></div>
      <div style={styles.profileMini}>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {meLoading ? <div style={{ color: "#94a3b8", fontSize: 13 }}>Loading...</div> : me ? <div><div style={styles.profileMiniName}>{me.name}</div><div style={styles.profileMiniEmail}>{me.district}</div></div> : <div style={{ color: "#94a3b8", fontSize: 13 }}>No profile</div>}
        </div>
        
        {/* ✅ My Orders Button Added */}
        <button style={{...styles.cartBtn, background: '#4f46e5', marginLeft: '10px'}} onClick={() => navigate('/supermarket/my-orders')}>
          📦 My Orders
        </button>

        <button style={styles.cartBtn} onClick={onCart}>🧺 Cart <b>({cartCount})</b></button>
      </div>
    </div>
  );
}

function StatChip({ label, value }) { return (<div style={styles.statChip}><div style={styles.statLabel}>{label}</div><div style={styles.statValue}>{value}</div></div>); }

const styles = {
  page: { padding: 20, minHeight: "100vh", background: "#0b1220", color: "#e5e7eb", fontFamily: "'Inter', sans-serif" },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#94a3b8' },
  header: { display: "grid", gridTemplateColumns: "1fr minmax(260px, 520px) auto", gap: 12, alignItems: "end", marginBottom: 20 },
  hTitle: { fontSize: 24, fontWeight: 800, letterSpacing: -0.5 },
  hSub: { fontSize: 14, color: "#94a3b8", marginTop: 4 },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 12, padding: "10px 12px" },
  search: { width: "100%", border: "none", outline: "none", background: "transparent", color: "#e5e7eb", fontSize: 14 },
  profileMini: { display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "8px 12px", borderRadius: 12, border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.05)", minWidth: 260 },
  profileMiniName: { fontSize: 14, fontWeight: 700 },
  profileMiniEmail: { fontSize: 12, color: "#10b981", marginTop: 2 },
  cartBtn: { border: "none", background: "#10b981", color: "#ffffff", padding: "8px 16px", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  topBar: { display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", alignItems: "center", marginBottom: 20 },
  statsRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  statChip: { border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.05)", borderRadius: 10, padding: "8px 16px", minWidth: 100 },
  statLabel: { fontSize: 12, color: "#94a3b8" },
  statValue: { fontSize: 18, fontWeight: 700, marginTop: 4 },
  controls: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  select: { padding: "10px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.10)", background: "#1e293b", color: "#e5e7eb", outline: "none", fontSize: 13 },
  resetBtn: { padding: "10px 16px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: "#e5e7eb", cursor: "pointer", fontSize: 13 },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 },
  card: { borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.10)", background: "#111827", transition: "transform 0.2s" },
  imgWrap: { position: "relative", height: 180, background: "#1f2937" },
  img: { width: "100%", height: "100%", objectFit: "cover" },
  noImg: { height: "100%", display: "grid", placeItems: "center", color: "#6b7280", fontSize: 13 },
  badge: { position: "absolute", top: 10, left: 10, fontSize: 11, padding: "4px 8px", borderRadius: 4, color: "#fff", fontWeight: 600, textTransform: 'uppercase' },
  cardBody: { padding: 16 },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, marginBottom: 12 },
  title: { fontWeight: 700, fontSize: 16, lineHeight: 1.4, color: '#fff' },
  price: { fontWeight: 700, fontSize: 16, color: "#34d399" },
  meta: { marginBottom: 16, padding: 10, borderRadius: 8, background: "rgba(255,255,255,0.03)" },
  metaRow: { display: "flex", justifyContent: "space-between", gap: 10, padding: "4px 0", fontSize: 13 },
  metaLabel: { color: "#94a3b8" },
  metaValue: { color: "#e5e7eb", fontWeight: 500 },
  cartRow: { display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" },
  qtyWrap: { display: "flex", alignItems: "center", gap: 0, border: '1px solid #374151', borderRadius: 6 },
  qtyBtn: { width: 30, height: 30, background: "transparent", color: "#e5e7eb", cursor: "pointer", border: 'none', fontSize: 16 },
  qtyInput: { width: 40, height: 30, background: "transparent", color: "#e5e7eb", outline: "none", textAlign: "center", border: 'none', fontSize: 14, fontWeight: 600 },
  addBtn: { border: "none", background: "#3b82f6", color: "#fff", padding: "8px 16px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 },
  emptyWrap: { marginTop: 40, padding: 40, textAlign: "center", background: "rgba(255,255,255,0.02)", borderRadius: 16, border: '1px dashed rgba(255,255,255,0.1)' },
  emptyIcon: { fontSize: 48, marginBottom: 16, opacity: 0.5 },
  emptyTitle: { fontSize: 18, fontWeight: 700 },
  emptyText: { marginTop: 8, color: "#94a3b8", fontSize: 14 },
  modalOverlay: { position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", display: "flex", justifyContent: 'center', alignItems: 'center', zIndex: 100, backdropFilter: 'blur(4px)' },
  modal: { width: "100%", maxWidth: 500, borderRadius: 16, background: "#111827", border: '1px solid #374151', boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", overflow: "hidden", maxHeight: '90vh', display: 'flex', flexDirection: 'column' },
  modalHead: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottom: "1px solid #374151", background: '#1f2937' },
  modalClose: { background: "transparent", color: "#9ca3af", border: "none", cursor: "pointer", fontSize: 20 },
  cartTable: { padding: 20, overflowY: 'auto', flex: 1 },
  cartItemRow: { display: "flex", gap: 12, alignItems: "center", padding: "12px 0", borderBottom: '1px solid #374151' },
  cartQty: { width: 60, padding: 6, borderRadius: 6, border: "1px solid #374151", background: "#0b1220", color: "#e5e7eb", textAlign: "center" },
  formGroup: { padding: "0 20px 16px" },
  label: { display: "block", fontSize: 13, color: "#9ca3af", marginBottom: 6, fontWeight: 500 },
  textarea: { width: "100%", minHeight: 80, borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#e5e7eb", padding: 12, outline: "none", resize: 'vertical' },
  input: { width: "100%", height: 42, borderRadius: 8, border: "1px solid #374151", background: "#0b1220", color: "#e5e7eb", padding: "0 12px", outline: "none" },
  modalFoot: { padding: 20, display: "flex", justifyContent: "space-between", gap: 12, borderTop: "1px solid #374151", background: '#1f2937' },
  payBtn: { flex: 1, padding: 10, borderRadius: 8, color: 'white', cursor: 'pointer', fontWeight: 600, transition: 'background 0.2s', fontSize: 13 },
  cardForm: { background: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 8, marginBottom: 15, margin: '0 20px', border: '1px solid #374151' }
};