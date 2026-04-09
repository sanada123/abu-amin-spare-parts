"use client";
import { useState } from "react";

const ADMIN_PASS = "admin2026";

const BTN: React.CSSProperties = {
  background: "#FFD700",
  border: "2px solid #1a1a1a",
  borderRadius: 8,
  padding: "8px 18px",
  cursor: "pointer",
  fontWeight: 700,
  fontSize: 14,
};
const INPUT: React.CSSProperties = {
  border: "1.5px solid #ccc",
  borderRadius: 8,
  padding: "10px 12px",
  fontSize: 14,
  width: "100%",
  boxSizing: "border-box",
  direction: "rtl",
};

export default function AdminSettingsPage() {
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState("");

  // Settings state — these would typically be stored in a DB or env
  // For now, shown as read-only with instructions to edit .env
  const settings = [
    { key: "TELEGRAM_BOT_TOKEN", label: "טוקן בוט טלגרם", desc: "מ-@BotFather", value: process.env.NEXT_PUBLIC_TELEGRAM_SET ? "✅ מוגדר" : "❌ חסר — הגדר ב-.env", editable: false },
    { key: "TELEGRAM_CHAT_ID", label: "Telegram Chat ID", desc: "ה-ID שלך בטלגרם (כברירת מחדל: 422035227)", value: process.env.NEXT_PUBLIC_TELEGRAM_CHAT_SET ? "✅ מוגדר" : "❌ חסר — הגדר ב-.env", editable: false },
    { key: "NEXT_PUBLIC_WHATSAPP_NUMBER", label: "מספר וואטסאפ", desc: "פורמט: 972501234567", value: process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "❌ חסר", editable: false },
    { key: "NEXT_PUBLIC_PHONE_NUMBER", label: "מספר טלפון", desc: "מוצג בראש הדף ובפוטר", value: process.env.NEXT_PUBLIC_PHONE_NUMBER || "❌ חסר", editable: false },
    { key: "NEXT_PUBLIC_BUSINESS_ADDRESS", label: "כתובת העסק", desc: "מוצג בפוטר", value: process.env.NEXT_PUBLIC_BUSINESS_ADDRESS || "עוספיא / דלית אל כרמל", editable: false },
    { key: "NEXT_PUBLIC_VAT_ID", label: "ח״פ", desc: "מספר חברה — מוצג בפוטר", value: process.env.NEXT_PUBLIC_VAT_ID || "❌ חסר", editable: false },
  ];

  function flash(m: string) {
    setMsg(m);
    setTimeout(() => setMsg(""), 3000);
  }

  if (!authed) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f5f5f5" }}>
        <div style={{ background: "white", borderRadius: 16, padding: 40, width: 320, boxShadow: "0 4px 24px rgba(0,0,0,0.1)", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚙️</div>
          <h2 style={{ marginBottom: 24, fontSize: 20 }}>הגדרות — כניסה</h2>
          <input
            type="password"
            placeholder="סיסמה"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (pw === ADMIN_PASS ? setAuthed(true) : flash("סיסמה שגויה"))}
            style={{ ...INPUT, marginBottom: 16, textAlign: "center" }}
          />
          <button style={{ ...BTN, width: "100%" }} onClick={() => pw === ADMIN_PASS ? setAuthed(true) : flash("סיסמה שגויה")}>כניסה</button>
          {msg && <p style={{ color: "red", marginTop: 12, fontSize: 14 }}>{msg}</p>}
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f8f8", direction: "rtl", fontFamily: "system-ui, sans-serif" }}>
      <div style={{ background: "#1a1a1a", color: "white", padding: "14px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 900, fontSize: 18 }}>⚙️ הגדרות — אבו אמין</span>
        <div style={{ display: "flex", gap: 8 }}>
          <a href="/admin" style={{ ...BTN, fontSize: 13, padding: "6px 14px", textDecoration: "none", display: "inline-block" }}>← ניהול</a>
          <button style={{ ...BTN, fontSize: 13, padding: "6px 14px" }} onClick={() => setAuthed(false)}>יציאה</button>
        </div>
      </div>

      {msg && <div style={{ background: "#fff3cd", padding: "10px 24px", textAlign: "center", fontWeight: 700 }}>{msg}</div>}

      <div style={{ padding: "24px" }}>
        <div style={{ background: "white", borderRadius: 12, padding: 24, border: "1px solid #e5e5e5", maxWidth: 720 }}>
          <h2 style={{ margin: "0 0 8px", fontSize: 18 }}>הגדרות מערכת</h2>
          <p style={{ color: "#888", fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
            הגדרות אלו מנוהלות דרך משתני סביבה בקובץ <code style={{ background: "#f0f0f0", padding: "2px 6px", borderRadius: 4 }}>.env.local</code> (בסביבת פיתוח) או הגדרות הפלטפורמה ב-Railway.
            <br />לאחר שינוי יש לעשות <strong>restart</strong> לשרת.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {settings.map((s) => (
              <div key={s.key} style={{ borderBottom: "1px solid #f0f0f0", paddingBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{s.label}</div>
                    <div style={{ color: "#888", fontSize: 12, marginTop: 2 }}>{s.desc}</div>
                  </div>
                  <code style={{
                    background: "#f0f0f0",
                    color: "#333",
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    fontFamily: "monospace",
                  }}>
                    {s.key}
                  </code>
                </div>
                <div style={{
                  background: s.value.startsWith("✅") ? "#e8f5e9" : s.value.startsWith("❌") ? "#fff3f3" : "#f5f5f5",
                  color: s.value.startsWith("✅") ? "#2e7d32" : s.value.startsWith("❌") ? "#c62828" : "#333",
                  padding: "10px 14px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                }}>
                  {s.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 24, background: "#fffbf0", border: "1px solid #ffe082", borderRadius: 10, padding: 16 }}>
            <h4 style={{ margin: "0 0 8px", fontSize: 14 }}>📋 קובץ .env.local לדוגמה:</h4>
            <pre style={{ margin: 0, fontSize: 12, lineHeight: 1.8, color: "#333", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>
{`TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_CHAT_ID=422035227
NEXT_PUBLIC_WHATSAPP_NUMBER=972501234567
NEXT_PUBLIC_PHONE_NUMBER=050-1234567
NEXT_PUBLIC_BUSINESS_ADDRESS=עוספיא / דלית אל כרמל
NEXT_PUBLIC_VAT_ID=XXXXXXXX`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
