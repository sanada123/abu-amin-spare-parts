"use client";
import { useState, useEffect } from "react";

const ADMIN_PASS = "admin2026";
const API_PASS = "Bearer admin-abu-amin-2026";

type Part = { id: number; slug: string; name: string; categoryId: number; minPrice: number; stock: number };
type Kit = { id: number; slug: string; name: string; kitType: string; totalPriceIls: number; discountPct: number };

const BTN: React.CSSProperties = { background: "#FFD700", border: "2px solid #1a1a1a", borderRadius: 8, padding: "8px 18px", cursor: "pointer", fontWeight: 700, fontSize: 14 };
const BTN_SM: React.CSSProperties = { ...BTN, background: "white", color: "#cc0000", borderColor: "#cc0000", padding: "6px 12px", fontSize: 13 };
const INPUT: React.CSSProperties = { border: "1.5px solid #ccc", borderRadius: 8, padding: "8px 12px", fontSize: 14, width: "100%", boxSizing: "border-box" };

const CATEGORIES = [
  [1, "בלמים"], [2, "מסננים"], [3, "מנוע"], [4, "מתלים"], [5, "חשמל"],
  [6, "תאורה"], [7, "קירור"], [8, "שמנים"], [9, "גיר"], [10, "פליטה"], [11, "מרכב"], [12, "צמיגים"],
] as const;

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [tab, setTab] = useState<"parts" | "kits">("parts");
  const [parts, setParts] = useState<Part[]>([]);
  const [kits, setKits] = useState<Kit[]>([]);
  const [msg, setMsg] = useState("");
  const [newPart, setNewPart] = useState({ name: "", categoryId: 1, minPrice: 0, stock: 0, slug: "" });
  const [newKit, setNewKit] = useState({ name: "", kitType: "major-service", totalPriceIls: 0, discountPct: 10, slug: "" });

  useEffect(() => { if (authed) loadData(); }, [authed]);

  async function loadData() {
    const headers = { Authorization: API_PASS };
    const [pr, kr] = await Promise.all([
      fetch("/api/admin/parts", { headers }),
      fetch("/api/admin/kits", { headers }),
    ]);
    const pd = await pr.json(); const kd = await kr.json();
    setParts(pd.parts || []); setKits(kd.kits || []);
  }

  function flash(m: string) { setMsg(m); setTimeout(() => setMsg(""), 3000); }

  async function addPart() {
    if (!newPart.name || !newPart.slug) return flash("מלא שם ו-slug");
    const r = await fetch("/api/admin/parts", { method: "POST", headers: { Authorization: API_PASS, "Content-Type": "application/json" }, body: JSON.stringify(newPart) });
    if (r.ok) { flash("✅ חלק נוסף"); setNewPart({ name: "", categoryId: 1, minPrice: 0, stock: 0, slug: "" }); loadData(); }
    else flash("שגיאה");
  }

  async function deletePart(id: number) {
    if (!confirm("למחוק?")) return;
    await fetch(`/api/admin/parts?id=${id}`, { method: "DELETE", headers: { Authorization: API_PASS } });
    flash("🗑️ נמחק"); loadData();
  }

  async function addKit() {
    if (!newKit.name || !newKit.slug) return flash("מלא שם ו-slug");
    const r = await fetch("/api/admin/kits", { method: "POST", headers: { Authorization: API_PASS, "Content-Type": "application/json" }, body: JSON.stringify(newKit) });
    if (r.ok) { flash("✅ קיט נוסף"); setNewKit({ name: "", kitType: "major-service", totalPriceIls: 0, discountPct: 10, slug: "" }); loadData(); }
    else flash("שגיאה");
  }

  async function deleteKit(id: number) {
    if (!confirm("למחוק?")) return;
    await fetch(`/api/admin/kits?id=${id}`, { method: "DELETE", headers: { Authorization: API_PASS } });
    flash("🗑️ נמחק"); loadData();
  }

  if (!authed) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "white", borderRadius: 16, padding: 40, width: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h2 style={{ marginBottom: 24, fontSize: 20 }}>כניסה לאדמין</h2>
        <input type="password" placeholder="סיסמה" value={pw}
          onChange={e => setPw(e.target.value)}
          onKeyDown={e => e.key === "Enter" && (pw === ADMIN_PASS ? setAuthed(true) : flash("סיסמה שגויה"))}
          style={{ ...INPUT, marginBottom: 16, textAlign: "center", direction: "rtl" }} />
        <button style={{ ...BTN, width: "100%" }} onClick={() => pw === ADMIN_PASS ? setAuthed(true) : flash("סיסמה שגויה")}>כניסה</button>
        {msg && <p style={{ color: "red", marginTop: 12, fontSize: 14 }}>{msg}</p>}
      </div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f8", direction: "rtl", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#1a1a1a", color: "white", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 900, fontSize: 18 }}>🔧 לוח בקרה — אבו אמין חלפים</span>
        <button style={{ ...BTN, fontSize: 13, padding: "6px 14px" }} onClick={() => setAuthed(false)}>יציאה</button>
      </div>

      {msg && <div style={{ background: msg.startsWith("✅") ? "#e6f9e6" : "#fff3cd", padding: "10px 24px", textAlign: "center", fontWeight: 700, borderBottom: "2px solid #ccc" }}>{msg}</div>}

      <div style={{ padding: "20px 24px 0" }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
          <button onClick={() => setTab("parts")} style={{ ...BTN, background: tab === "parts" ? "#FFD700" : "white", border: `2px solid ${tab === "parts" ? "#1a1a1a" : "#ccc"}` }}>⚙️ חלפים ({parts.length})</button>
          <button onClick={() => setTab("kits")} style={{ ...BTN, background: tab === "kits" ? "#FFD700" : "white", border: `2px solid ${tab === "kits" ? "#1a1a1a" : "#ccc"}` }}>📦 קיטים ({kits.length})</button>
          <button style={{ ...BTN, background: "white", marginInlineStart: "auto" }} onClick={loadData}>🔄 רענן</button>
        </div>

        {/* PARTS */}
        {tab === "parts" && (
          <div>
            <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 24, border: "1px solid #e5e5e5" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>➕ הוסף חלק חדש</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>שם (עברית)</label>
                  <input style={INPUT} value={newPart.name} onChange={e => setNewPart({ ...newPart, name: e.target.value })} placeholder="רפידות בלם קדמיות" /></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>Slug (אנגלית)</label>
                  <input style={INPUT} value={newPart.slug} onChange={e => setNewPart({ ...newPart, slug: e.target.value })} placeholder="front-brake-pads" /></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>קטגוריה</label>
                  <select style={INPUT} value={newPart.categoryId} onChange={e => setNewPart({ ...newPart, categoryId: +e.target.value })}>
                    {CATEGORIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>מחיר מינ׳ (₪)</label>
                  <input style={INPUT} type="number" value={newPart.minPrice} onChange={e => setNewPart({ ...newPart, minPrice: +e.target.value })} /></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>מלאי</label>
                  <input style={INPUT} type="number" value={newPart.stock} onChange={e => setNewPart({ ...newPart, stock: +e.target.value })} /></div>
              </div>
              <button style={{ ...BTN, marginTop: 16 }} onClick={addPart}>+ הוסף חלק</button>
            </div>
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e5e5", overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
                <thead><tr style={{ background: "#f0f0f0", fontSize: 13 }}>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>ID</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>שם</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>Slug</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>קטגוריה</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>מחיר</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}></th>
                </tr></thead>
                <tbody>
                  {parts.length === 0 && <tr><td colSpan={6} style={{ padding: 24, textAlign: "center", color: "#999" }}>אין חלפים מותאמים אישית — הנתונים הנוכחיים מ-mock data</td></tr>}
                  {parts.map((p, i) => (
                    <tr key={p.id} style={{ borderTop: "1px solid #f0f0f0", background: i % 2 ? "#fafafa" : "white" }}>
                      <td style={{ padding: "10px 14px", color: "#888", fontSize: 13 }}>{p.id}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: "10px 14px", fontSize: 12, fontFamily: "monospace", color: "#555" }}>{p.slug}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13 }}>{CATEGORIES.find(c => c[0] === p.categoryId)?.[1]}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700 }}>₪{p.minPrice}</td>
                      <td style={{ padding: "10px 14px" }}><button style={BTN_SM} onClick={() => deletePart(p.id)}>מחק</button></td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* KITS */}
        {tab === "kits" && (
          <div>
            <div style={{ background: "white", borderRadius: 12, padding: 20, marginBottom: 24, border: "1px solid #e5e5e5" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: 16 }}>➕ הוסף קיט חדש</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
                <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>שם</label>
                  <input style={INPUT} value={newKit.name} onChange={e => setNewKit({ ...newKit, name: e.target.value })} placeholder="טיפול גדול קורולה" /></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>Slug</label>
                  <input style={INPUT} value={newKit.slug} onChange={e => setNewKit({ ...newKit, slug: e.target.value })} placeholder="major-corolla" /></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>סוג</label>
                  <select style={INPUT} value={newKit.kitType} onChange={e => setNewKit({ ...newKit, kitType: e.target.value })}>
                    <option value="major-service">טיפול גדול</option>
                    <option value="brake-service">חבילת בלמים</option>
                    <option value="oil-change">החלפת שמן</option>
                  </select></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>מחיר (₪)</label>
                  <input style={INPUT} type="number" value={newKit.totalPriceIls} onChange={e => setNewKit({ ...newKit, totalPriceIls: +e.target.value })} /></div>
                <div><label style={{ fontSize: 12, fontWeight: 700, display: "block", marginBottom: 4 }}>הנחה %</label>
                  <input style={INPUT} type="number" value={newKit.discountPct} onChange={e => setNewKit({ ...newKit, discountPct: +e.target.value })} /></div>
              </div>
              <button style={{ ...BTN, marginTop: 16 }} onClick={addKit}>+ הוסף קיט</button>
            </div>
            <div style={{ background: "white", borderRadius: 12, border: "1px solid #e5e5e5", overflow: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 400 }}>
                <thead><tr style={{ background: "#f0f0f0", fontSize: 13 }}>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>שם</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>סוג</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>מחיר</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}>הנחה</th>
                  <th style={{ padding: "10px 14px", textAlign: "right" }}></th>
                </tr></thead>
                <tbody>
                  {kits.length === 0 && <tr><td colSpan={5} style={{ padding: 24, textAlign: "center", color: "#999" }}>אין קיטים — הוסף מלמעלה</td></tr>}
                  {kits.map((k, i) => (
                    <tr key={k.id} style={{ borderTop: "1px solid #f0f0f0", background: i % 2 ? "#fafafa" : "white" }}>
                      <td style={{ padding: "10px 14px", fontWeight: 600 }}>{k.name}</td>
                      <td style={{ padding: "10px 14px", fontSize: 13 }}>{k.kitType}</td>
                      <td style={{ padding: "10px 14px", fontWeight: 700 }}>₪{k.totalPriceIls}</td>
                      <td style={{ padding: "10px 14px" }}>{k.discountPct}%</td>
                      <td style={{ padding: "10px 14px" }}><button style={BTN_SM} onClick={() => deleteKit(k.id)}>מחק</button></td>
                    </tr>))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
