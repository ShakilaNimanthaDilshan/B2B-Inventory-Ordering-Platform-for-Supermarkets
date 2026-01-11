import React, { useEffect, useMemo, useState } from "react";
import api from "../services/api";

export default function SupermarketDashboard() {
  const [products, setProducts] = useState([]);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(true);

  const [me, setMe] = useState(null);
  const [meLoading, setMeLoading] = useState(true);

  // ✅ UI controls
  const [stockFilter, setStockFilter] = useState("all"); // all | in | low | out
  const [sortBy, setSortBy] = useState("newest"); // newest | priceAsc | priceDesc | name

  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        setMeLoading(true);

        const [meRes, prodRes] = await Promise.all([
          api.get("/api/auth/me"),
          api.get("/api/products"),
        ]);

        setMe(meRes.data);
        setProducts(prodRes.data || []);
      } catch (err) {
        console.error(err);
        alert(err?.response?.data?.message || "Dashboard load failed");
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

    // search
    if (s) {
      list = list.filter((p) => {
        const name = (p.name || "").toLowerCase();
        const category = (p.category || "").toLowerCase();
        const supplier = (p.supplier?.name || "").toLowerCase();
        return name.includes(s) || category.includes(s) || supplier.includes(s);
      });
    }

    // stock filter
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

    // sort
    if (sortBy === "priceAsc") {
      list.sort((a, b) => Number(a.price || 0) - Number(b.price || 0));
    } else if (sortBy === "priceDesc") {
      list.sort((a, b) => Number(b.price || 0) - Number(a.price || 0));
    } else if (sortBy === "name") {
      list.sort((a, b) => String(a.name || "").localeCompare(String(b.name || "")));
    } else {
      // newest
      list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return list;
  }, [products, q, stockFilter, sortBy]);

  if (loading) {
    return (
      <div style={styles.page}>
        <Header
          q={q}
          setQ={setQ}
          count={0}
          me={me}
          meLoading={meLoading}
        />
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
      <Header
        q={q}
        setQ={setQ}
        count={filtered.length}
        me={me}
        meLoading={meLoading}
      />

      {/* ✅ Quick stats + controls */}
      <div style={styles.topBar}>
        <div style={styles.statsRow}>
          <StatChip label="Total" value={stats.total} />
          <StatChip label="In Stock" value={stats.instock} />
          <StatChip label="Low" value={stats.low} />
          <StatChip label="Out" value={stats.out} />
        </div>

        <div style={styles.controls}>
          <select
            value={stockFilter}
            onChange={(e) => setStockFilter(e.target.value)}
            style={styles.select}
          >
            <option value="all">All stock</option>
            <option value="in">In stock</option>
            <option value="low">Low stock</option>
            <option value="out">Out of stock</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.select}
          >
            <option value="newest">Sort: Newest</option>
            <option value="priceAsc">Sort: Price ↑</option>
            <option value="priceDesc">Sort: Price ↓</option>
            <option value="name">Sort: Name A→Z</option>
          </select>

          <button
            style={styles.resetBtn}
            onClick={() => {
              setQ("");
              setStockFilter("all");
              setSortBy("newest");
            }}
          >
            Reset
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={styles.emptyWrap}>
          <div style={styles.emptyIcon}>🛒</div>
          <div style={styles.emptyTitle}>No products found</div>
          <div style={styles.emptyText}>
            Try a different keyword or reset filters.
          </div>
        </div>
      ) : (
        <div style={styles.grid}>
          {filtered.map((p) => {
            const badge = stockBadge(p.stock);
            return (
              <div key={p._id} style={styles.card}>
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
                      <span style={styles.metaValue}>{p.supplier?.name || "-"}</span>
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
                      {p.updatedAt ? new Date(p.updatedAt).toLocaleDateString() : "-"}
                    </div>

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

function Header({ q, setQ, count, me, meLoading }) {
  return (
    <div style={styles.header}>
      {/* Left */}
      <div>
        <div style={styles.hTitle}>Supermarket Dashboard</div>
        <div style={styles.hSub}>
          Showing <b>{count}</b> supplier products
        </div>
      </div>

      {/* Middle search */}
      <div style={styles.searchWrap}>
        <span style={styles.searchIcon}>🔍</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search product / category / supplier..."
          style={styles.search}
        />
      </div>

      {/* ✅ Right profile */}
      <div style={styles.profileMini}>
        {meLoading ? (
          <div style={{ color: "#94a3b8", fontSize: 13 }}>Loading...</div>
        ) : me ? (
          <>
            <div>
              <div style={styles.profileMiniName}>{me.name}</div>
              <div style={styles.profileMiniEmail}>{me.email}</div>
            </div>
            <div style={styles.profileMiniBadges}>
              <span style={styles.roleBadge}>{me.role}</span>
              <span
                style={{
                  ...styles.approvalBadge,
                  borderColor: me.isApproved
                    ? "rgba(34,197,94,0.35)"
                    : "rgba(245,158,11,0.35)",
                  background: me.isApproved
                    ? "rgba(34,197,94,0.12)"
                    : "rgba(245,158,11,0.12)",
                }}
              >
                {me.isApproved ? "Approved" : "Pending"}
              </span>
            </div>
          </>
        ) : (
          <div style={{ color: "#94a3b8", fontSize: 13 }}>No profile</div>
        )}
      </div>
    </div>
  );
}

function StatChip({ label, value }) {
  return (
    <div style={styles.statChip}>
      <div style={styles.statLabel}>{label}</div>
      <div style={styles.statValue}>{value}</div>
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
    display: "grid",
    gridTemplateColumns: "1fr minmax(260px, 520px) auto",
    gap: 12,
    alignItems: "end",
    marginBottom: 14,
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
    boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
  },
  searchIcon: { opacity: 0.8 },
  search: {
    width: "100%",
    border: "none",
    outline: "none",
    background: "transparent",
    color: "#124ab8ff",
    fontSize: 14,
  },

  // ✅ profile mini on right
  profileMini: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    boxShadow: "0 10px 30px rgba(0,0,0,0.22)",
    minWidth: 260,
  },
  profileMiniName: { fontSize: 14, fontWeight: 900, lineHeight: 1.2 },
  profileMiniEmail: { fontSize: 12, color: "#94a3b8", marginTop: 3 },
  profileMiniBadges: { display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "flex-end" },

  roleBadge: {
    fontSize: 11,
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(255,255,255,0.08)",
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  },
  approvalBadge: {
    fontSize: 11,
    fontWeight: 800,
    padding: "6px 10px",
    borderRadius: 999,
    border: "1px solid rgba(34,197,94,0.35)",
    background: "rgba(34,197,94,0.12)",
    whiteSpace: "nowrap",
  },

  // ✅ top stats + controls
  topBar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    alignItems: "center",
    marginBottom: 14,
  },
  statsRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  statChip: {
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.05)",
    borderRadius: 14,
    padding: "10px 12px",
    minWidth: 110,
    boxShadow: "0 10px 30px rgba(0,0,0,0.20)",
  },
  statLabel: { fontSize: 12, color: "#94a3b8" },
  statValue: { fontSize: 18, fontWeight: 900, marginTop: 4 },

  controls: { display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" },
  select: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
    color: "#1051d2ff",
    outline: "none",
  },
  resetBtn: {
    padding: "10px 12px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.08)",
    color: "#e5e7eb",
    cursor: "pointer",
    fontWeight: 800,
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
  },

  imgWrap: {
    position: "relative",
    height: 160,
    background: "rgba(255,255,255,0.06)",
  },
  img: { width: "100%", height: "100%", objectFit: "cover", display: "block" },
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
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
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
  metaRow: { display: "flex", justifyContent: "space-between", gap: 10, padding: "6px 0" },
  metaLabel: { fontSize: 12, color: "#94a3b8" },
  metaValue: { fontSize: 13, color: "#e5e7eb", fontWeight: 600 },

  footerRow: { marginTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10 },
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

  skeletonCard: {
    height: 290,
    borderRadius: 16,
    border: "1px solid rgba(255,255,255,0.10)",
    background:
      "linear-gradient(90deg, rgba(255,255,255,0.04), rgba(255,255,255,0.09), rgba(255,255,255,0.04))",
    backgroundSize: "200% 100%",
    animation: "shimmer 1.2s infinite",
  },

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
