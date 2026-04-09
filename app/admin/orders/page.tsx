"use client";
import { useState, useEffect } from "react";

const ADMIN_PASS = "admin2026";
const API_PASS = "Bearer admin-abu-amin-2026";

type OrderStatus = "new" | "confirmed" | "shipped" | "delivered" | "handled";

interface OrderPart {
  name: string;
  partNumber: string;
  priceIls: number;
  qty: number;
}

interface Order {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  city: string;
  vehicle: string;
  notes: string;
  parts: OrderPart[];
  subtotal: number;
  status: OrderStatus;
}

const BTN: React.CSSProperties = {
  background: "#FFD700",
  border: "2px solid #1a1a1a",
  borderRadius: 8,
  padding: "8px 18px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};

const STATUS_COLORS: Record<OrderStatus, string> = {
  new: "#e74c3c",
  confirmed: "#f39c12",
  shipped: "#3498db",
  delivered: "#27ae60",
  handled: "#95a5a6",
};

const STATUS_LABELS: Record<OrderStatus, string> = {
  new: "חדש",
  confirmed: "אושר",
  shipped: "בדרך",
  delivered: "נמסר",
  handled: "טופל",
};

export default function AdminOrdersPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [msg, setMsg] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    if (authed) loadOrders();
  }, [authed]);

  async function loadOrders() {
    try {
      const r = await fetch("/api/order", { headers: { Authorization: API_PASS } });
      const d = await r.json();
      setOrders(d.orders || []);
    } catch {
      setMsg("שגיאה בטעינת הזמנות");
    }
  }

  async function updateStatus(id: string, status: OrderStatus) {
    await fetch("/api/order", {
      method: "PATCH",
      headers: { Authorization: API_PASS, "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    flash(`✅ סטטוס עודכן ל-${STATUS_LABELS[status]}`);
    loadOrders();
  }

  function flash(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  }

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 40, width: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📦</div>
          <h2 style={{ marginBottom: 24, fontSize: 20 }}>הזמנות — כניסה</h2>
          <input
            type="password"
            placeholder="סיסמה"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (pw === ADMIN_PASS ? setAuthed(true) : flash("סיסמה שגויה"))}
            style={{ border: "1.5px solid #ccc", borderRadius: 8, padding: "8px 12px", fontSize: 14, width: "100%", boxSizing: "border-box", marginBottom: 16, textAlign: "center", direction: "rtl" }}
          />
          <button style={{ ...BTN, width: "100%" }} onClick={() => pw === ADMIN_PASS ? setAuthed(true) : flash("סיסמה שגויה")}>כניסה</button>
          {msg && <p style={{ color: "red", marginTop: 12, fontSize: 14 }}>{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f8", direction: "rtl", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#1a1a1a", color: "white", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 900, fontSize: 18 }}>📦 הזמנות — אבו אמין</span>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/admin" style={{ ...BTN, fontSize: 13, padding: "6px 14px", textDecoration: "none", display: "inline-block" }}>← ניהול</a>
          <button style={{ ...BTN, fontSize: 13, padding: "6px 14px" }} onClick={() => setAuthed(false)}>יציאה</button>
        </div>
      </div>

      {msg && <div style={{ background: msg.startsWith("✅") ? "#e6f9e6" : "#fff3cd", padding: "10px 24px", textAlign: "center", fontWeight: 700 }}>{msg}</div>}

      <div style={{ padding: "20px 24px" }}>
        {/* Filters */}
        <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
          {(["all", "new", "confirmed", "shipped", "delivered", "handled"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                ...BTN,
                background: filter === s ? "#FFD700" : "white",
                border: `2px solid ${filter === s ? "#1a1a1a" : "#ccc"}`,
                fontSize: 13,
              }}
            >
              {s === "all" ? `כל ההזמנות (${orders.length})` : `${STATUS_LABELS[s]} (${orders.filter((o) => o.status === s).length})`}
            </button>
          ))}
          <button style={{ ...BTN, background: "white", marginInlineStart: "auto" }} onClick={loadOrders}>🔄 רענן</button>
        </div>

        {/* Orders list */}
        {visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: 60, color: "#999", fontSize: 18 }}>אין הזמנות</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {visible.map((order) => (
              <div key={order.id} style={{ background: "white", borderRadius: 12, border: "1px solid #e5e5e5", overflow: "hidden" }}>
                {/* Summary row */}
                <div
                  style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 12, cursor: "pointer", flexWrap: "wrap" }}
                  onClick={() => setExpanded(expanded === order.id ? null : order.id)}
                >
                  <span style={{
                    background: STATUS_COLORS[order.status],
                    color: "white",
                    borderRadius: 6,
                    padding: "3px 10px",
                    fontSize: 12,
                    fontWeight: 700,
                    minWidth: 60,
                    textAlign: "center",
                  }}>
                    {STATUS_LABELS[order.status]}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: 15 }}>{order.name}</span>
                  <span style={{ color: "#555", fontSize: 14 }}>📞 {order.phone}</span>
                  <span style={{ color: "#555", fontSize: 14 }}>📍 {order.city}</span>
                  <span style={{ color: "#888", fontSize: 13, marginInlineStart: "auto" }}>#{order.id}</span>
                  <span style={{ color: "#888", fontSize: 12 }}>
                    {new Date(order.createdAt).toLocaleDateString("he-IL", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span style={{ fontWeight: 700, color: "#e67e22", fontSize: 15 }}>₪{order.subtotal}</span>
                </div>

                {/* Expanded detail */}
                {expanded === order.id && (
                  <div style={{ borderTop: "1px solid #f0f0f0", padding: "16px 20px" }}>
                    <div style={{ marginBottom: 12, fontSize: 14, color: "#444" }}>
                      🚗 <strong>{order.vehicle}</strong>
                    </div>
                    {order.notes && (
                      <div style={{ marginBottom: 12, fontSize: 14, color: "#444" }}>
                        📝 {order.notes}
                      </div>
                    )}
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, marginBottom: 16 }}>
                      <thead>
                        <tr style={{ background: "#f9f9f9", fontSize: 12 }}>
                          <th style={{ padding: "8px 10px", textAlign: "right" }}>חלק</th>
                          <th style={{ padding: "8px 10px", textAlign: "right" }}>מק"ט</th>
                          <th style={{ padding: "8px 10px", textAlign: "center" }}>כמות</th>
                          <th style={{ padding: "8px 10px", textAlign: "right" }}>מחיר</th>
                        </tr>
                      </thead>
                      <tbody>
                        {order.parts.map((p, i) => (
                          <tr key={i} style={{ borderTop: "1px solid #f0f0f0" }}>
                            <td style={{ padding: "8px 10px", fontWeight: 600 }}>{p.name}</td>
                            <td style={{ padding: "8px 10px", color: "#777", fontFamily: "monospace" }}>{p.partNumber}</td>
                            <td style={{ padding: "8px 10px", textAlign: "center" }}>{p.qty}</td>
                            <td style={{ padding: "8px 10px", fontWeight: 700 }}>₪{p.priceIls * p.qty}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {(["new", "confirmed", "shipped", "delivered", "handled"] as OrderStatus[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          style={{
                            border: `2px solid ${STATUS_COLORS[s]}`,
                            background: order.status === s ? STATUS_COLORS[s] : "white",
                            color: order.status === s ? "white" : STATUS_COLORS[s],
                            borderRadius: 8,
                            padding: "6px 14px",
                            cursor: "pointer",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {STATUS_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
