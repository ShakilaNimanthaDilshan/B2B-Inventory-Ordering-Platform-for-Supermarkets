import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function SupermarketDashboard() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/products");
        setProducts(res.data || []);
      } catch (err) {
        console.error(err);
        alert("Products load failed");
      } finally {
        setLoading(false);
      }
    };

    loadProducts();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;

    return products.filter((p) => {
      const name = (p.name || "").toLowerCase();
      const category = (p.category || "").toLowerCase();
      const supplier = (p.supplier?.name || "").toLowerCase();
      return name.includes(s) || category.includes(s) || supplier.includes(s);
    });
  }, [products, q]);

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

  if (loading) {
    return (
      <div style={styles.page}>
        <Header q={q} setQ={setQ} count={0} />
        <div style={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} style={styles.skeletonCard} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <Header q={q} setQ={setQ} count={filtered.length} />

      {filtered.length === 0 ? (
        <div style={styles.emptyWrap}>
          <div style={styles.emptyIcon}>🛒</div>
          <div style={styles.emptyTitle}>No products found</div>
          <div style={styles.emptyText}>
            Try a different keyword (product, category, or supplier).
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((p) => {
            const badge = stockBadge(p.stock);
            return (
              <div key={p._id} style={styles.card}>
                {/* Image */}
                <div style={styles.imgWrap}>
                  {p.image ? (
                    <img
                      src={`http://localhost:5000${p.image}`}
                      alt={p.name}
                      style={styles.img}
                    />
                  ) : (
                    <div style={styles.noImg}>No Image</div>
                  )}

                  <div
                    style={{
                      ...styles.badge,
                      background: badge.bg,
                      borderColor: badge.bd,
                    }}
                  >
                    {badge.text}
                  </div>
                </div>

                {/* Body */}
                <div style={styles.cardBody}>
                  <div style={styles.topRow}>
                    <div style={styles.title} title={p.name}>
                      {p.name}
                    </div>
                    <div style={styles.price}>{fmtLKR(p.price)}</div>
                  </div>

                  <div style={styles.meta}>
                    <div style={styles.metaRow}>
                      <span style={styles.metaLabel}>Supplier</span>
                      <span style={styles.metaValue}>
                        {p.supplier?.name || "-"}
                      </span>
                    </div>

                    <div style={styles.metaRow}>
                      <span style={styles.metaLabel}>Category</span>
                      <span style={styles.metaValue}>{p.category || "-"}</span>
                    </div>

                    <div style={styles.metaRow}>
                      <span style={styles.metaLabel}>Stock</span>
                      <span style={styles.metaValue}>{p.stock}</span>
                    </div>
                  </div>

                  <div style={styles.footerRow}>
                    <div style={styles.smallNote}>
                      Updated:{" "}
                      {p.updatedAt
                        ? new Date(p.updatedAt).toLocaleDateString()
                        : "-"}
                    </div>

                    {/* Only UI (no ordering as you asked) */}
                    <button
                      style={{
                        ...styles.viewBtn,
                        opacity: Number(p.stock || 0) <= 0 ? 0.6 : 1,
                      }}
                      onClick={() => alert(`Selected: ${p.name}`)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Header({ q, setQ, count }) {
  return (
    <div style={styles.header}>
      <div>
        <div style={styles.hTitle}>Supermarket Dashboard</div>
        <div style={styles.hSub}>
          Showing <b>{count}</b> supplier products
        </div>
      </div>

      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search product / category / supplier..."
          style={styles.search}
        />
      </div>
    </div>
  );
}

const styles = {
  page: {
    padding: 20,
    minHeight: "100vh",
    background:
      "radial-gradient(1200px 600px at 20% 0%, rgba(99,102,241,0.18), transparent 55%), radial-gradient(1000px 500px at 90% 10%, rgba(34,197,94,0.14), transparent 55%), #0b1220",
    color: "#e5e7eb",
  },

  header: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    marginBottom: 16,
  },
  hTitle: { fontSize: 22, fontWeight: 800, letterSpacing: 0.2 },
  hSub: { fontSize: 13, color: "#94a3b8", marginTop: 6 },

  searchWrap: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.10)",
    borderRadius: 12,
    padding: "10px 12px",
    width: "100%",
    maxWidth: 440,
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  searchIcon: { opacity: 0.8 },
  search: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#e5e7eb",
    fontSize: 14,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
    gap: 14,
  },

  card: {
    borderRadius: 16,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 12px 40px rgba(0,0,0,0.30)",
    transform: "translateY(0)",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
  },

  imgWrap: {
    position: "relative",
    height: 160,
    background: "rgba(255,255,255,0.06)",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  noImg: {
    height: "100%",
    display: "grid",
    placeItems: "center",
    color: "#94a3b8",
    fontSize: 13,
  },

  badge: {
    position: "absolute",
    top: 10,
    left: 10,
    fontSize: 12,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid",
    color: "#e5e7eb",
    backdropFilter: "blur(8px)",
  },

  cardBody: { padding: 12 },

  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  title: {
    fontWeight: 800,
    fontSize: 16,
    lineHeight: 1.2,
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  price: { fontWeight: 800, fontSize: 14, color: "#a7f3d0" },

  meta: {
    marginTop: 10,
    padding: 10,
    borderRadius: 12,
    background: "rgba(0,0,0,0.18)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  metaRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    padding: "6px 0",
  },
  metaLabel: { fontSize: 12, color: "#94a3b8" },
  metaValue: { fontSize: 13, color: "#e5e7eb", fontWeight: 600 },

  footerRow: {
    marginTop: 10,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  smallNote: { fontSize: 12, color: "#94a3b8" },

  viewBtn: {
    border: "1px solid rgba(255,255,255,0.18)",
    background: "rgba(255,255,255,0.08)",
    color: "#e5e7eb",
    padding: "8px 12px",
    borderRadius: 12,
    cursor: "pointer",
    fontWeight: 700,
  },

  // Loading skeleton
  skeletonCard: {
    height: 290,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.2s infinite",
  },

  // Empty state
  emptyWrap: {
    marginTop: 28,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    padding: 22,
    textAlign: "center",
  },
  emptyIcon: { fontSize: 34, marginBottom: 10 },
  emptyTitle: { fontSize: 18, fontWeight: 800 },
  emptyText: { marginTop: 6, color: "#94a3b8", fontSize: 13 },
};
