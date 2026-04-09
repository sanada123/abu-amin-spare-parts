"use client";
import { useState } from "react";
import { useLocale, useActiveVehicleId, clearCart } from "@/lib/cart";
import { getVehicle, getPart } from "@/lib/data";
import { tr } from "@/lib/i18n";
import type { CartItem } from "@/lib/cart";

interface Props {
  items: CartItem[];
  subtotal: number;
}

export default function OrderSubmitForm({ items, subtotal }: Props) {
  const locale = useLocale();
  const vehicleId = useActiveVehicleId();
  const vehicle = vehicleId ? getVehicle(vehicleId) : null;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const vehicleLabel = vehicle
    ? `${vehicle.year} ${vehicle.makeName[locale]} ${vehicle.modelName[locale]} ${vehicle.engine}`
    : tr("no_vehicle_set", locale);

  const partsPayload = items.map((c) => {
    const part = getPart(c.partId);
    const sku = part?.skus.find((s) => s.id === c.skuId);
    return {
      name: part?.name[locale] ?? "?",
      partNumber: sku?.partNumber ?? "",
      priceIls: sku?.priceIls ?? 0,
      qty: c.qty,
    };
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !city.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          phone: phone.trim(),
          city: city.trim(),
          notes: notes.trim(),
          vehicle: vehicleLabel,
          parts: partsPayload,
          subtotal,
          locale,
        }),
      });
      if (!res.ok) throw new Error("Server error");
      setSuccess(true);
      clearCart();
    } catch {
      setError(tr("order_error", locale));
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{
        background: "var(--surface)",
        border: "1px solid var(--success)",
        borderRadius: "var(--radius-md)",
        padding: "40px 32px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
        <h2 style={{ color: "var(--success)", marginBottom: 8 }}>{tr("order_success", locale)}</h2>
        <p style={{ color: "var(--text-dim)" }}>{tr("order_success_sub", locale)}</p>
      </div>
    );
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    fontSize: "0.95rem",
    outline: "none",
    boxSizing: "border-box",
    direction: "rtl",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.82rem",
    fontWeight: 700,
    color: "var(--text-dim)",
    marginBottom: 6,
    letterSpacing: "0.02em",
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div>
        <label style={labelStyle} htmlFor="order-name">
          {tr("order_name", locale)} <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <input
          id="order-name"
          type="text"
          style={inputStyle}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={locale === "ar" ? "محمد سعيد" : "ישראל ישראלי"}
          required
          autoComplete="name"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="order-phone">
          {tr("order_phone", locale)} <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <input
          id="order-phone"
          type="tel"
          style={inputStyle}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="050-1234567"
          required
          autoComplete="tel"
          inputMode="tel"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="order-city">
          {tr("order_city", locale)} <span style={{ color: "var(--danger)" }}>*</span>
        </label>
        <input
          id="order-city"
          type="text"
          style={inputStyle}
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder={locale === "ar" ? "حيفا، شارع الاستقلال 12" : "חיפה, רח׳ הרצל 12"}
          required
          autoComplete="address-level2"
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="order-vehicle">
          {tr("order_vehicle", locale)}
        </label>
        <input
          id="order-vehicle"
          type="text"
          style={{ ...inputStyle, color: "var(--text-dim)", cursor: "not-allowed" }}
          value={vehicleLabel}
          readOnly
        />
      </div>

      <div>
        <label style={labelStyle} htmlFor="order-notes">
          {tr("order_notes", locale)}
        </label>
        <textarea
          id="order-notes"
          style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={locale === "ar" ? "أي ملاحظة إضافية..." : "הערה נוספת, זמן נוח לאיסוף..."}
        />
      </div>

      {error && (
        <div style={{ color: "var(--danger)", fontSize: "0.85rem", fontWeight: 600 }}>
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading || !name.trim() || !phone.trim() || !city.trim()}
        style={{
          background: loading ? "var(--surface-2)" : "var(--accent)",
          color: loading ? "var(--text-dim)" : "#000",
          border: "none",
          borderRadius: "var(--radius-sm)",
          padding: "16px 24px",
          fontSize: "1rem",
          fontWeight: 800,
          cursor: loading ? "not-allowed" : "pointer",
          width: "100%",
          transition: "opacity 0.15s",
          letterSpacing: "-0.01em",
        }}
      >
        {loading
          ? (locale === "ar" ? "جارٍ الإرسال..." : "שולח...")
          : `${tr("order_submit", locale)} →`}
      </button>
    </form>
  );
}
