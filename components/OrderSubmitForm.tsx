"use client";
import { useState } from "react";
import { useActiveVehicleId } from "@/lib/cart";
import { getVehicle, getPart, getBrand, vehicles } from "@/lib/data";
import type { CartItem } from "@/lib/cart";

interface Props {
  items: CartItem[];
  subtotal: number;
}

type CustomerType = "private" | "garage" | null;

export default function OrderSubmitForm({ items, subtotal }: Props) {
  const vehicleId = useActiveVehicleId();
  const vehicle = vehicleId ? getVehicle(vehicleId) : null;

  const [customerType, setCustomerType] = useState<CustomerType>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Manual vehicle input when no vehicle selected
  const [manualMake, setManualMake] = useState("");
  const [manualModel, setManualModel] = useState("");
  const [manualYear, setManualYear] = useState("");

  const vehicleLabel = vehicle
    ? `${vehicle.year} ${vehicle.makeName.he} ${vehicle.modelName.he} ${vehicle.engine}`
    : manualMake && manualModel && manualYear
      ? `${manualYear} ${manualMake} ${manualModel}`
      : "";

  const partsLines = items.map((c) => {
    const part = getPart(c.partId);
    const sku = part?.skus.find((s) => s.id === c.skuId);
    const brand = sku ? getBrand(sku.brandId) : null;
    return `• ${part?.name.he ?? "?"} | ${brand?.name ?? ""} | ${sku?.partNumber ?? ""} | כמות: ${c.qty} | ₪${(sku?.priceIls ?? 0) * c.qty}`;
  });

  const buildWhatsAppUrl = () => {
    const typeLabel = customerType === "garage" ? "מוסך" : "לקוח פרטי";
    const msg = [
      `🔧 *הזמנה חדשה — אבו אמין חלפים*`,
      ``,
      `👤 *${typeLabel}*`,
      `שם: ${name.trim()}`,
      `טלפון: ${phone.trim()}`,
      vehicleLabel ? `🚗 רכב: ${vehicleLabel}` : "",
      ``,
      `📦 *פריטים:*`,
      ...partsLines,
      ``,
      `💰 *סה"כ: ₪${subtotal}* (לפני מע"מ)`,
    ]
      .filter(Boolean)
      .join("\n");

    return `https://wa.me/972523158796?text=${encodeURIComponent(msg)}`;
  };

  const canSubmit = customerType !== null && name.trim().length > 0 && phone.trim().length > 0;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "14px 16px",
    background: "var(--surface-2)",
    border: "1px solid var(--border)",
    borderRadius: "var(--radius-sm)",
    color: "var(--text)",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
    direction: "rtl",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "0.85rem",
    fontWeight: 700,
    color: "var(--text-dim)",
    marginBottom: 6,
  };

  const cubeStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    padding: "20px 16px",
    borderRadius: "var(--radius-md)",
    border: active ? "2px solid var(--accent)" : "1px solid var(--border)",
    background: active ? "rgba(255,196,36,0.12)" : "var(--surface-2)",
    color: active ? "var(--accent)" : "var(--text-dim)",
    cursor: "pointer",
    transition: "all 0.2s",
    minHeight: 100,
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Step 1: Customer type — cubes */}
      <div>
        <label style={labelStyle}>סוג לקוח</label>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            type="button"
            onClick={() => setCustomerType("private")}
            style={cubeStyle(customerType === "private")}
          >
            <span style={{ fontSize: "2rem" }}>🧑</span>
            <span style={{ fontWeight: 800, fontSize: "1rem" }}>לקוח פרטי</span>
          </button>
          <button
            type="button"
            onClick={() => setCustomerType("garage")}
            style={cubeStyle(customerType === "garage")}
          >
            <span style={{ fontSize: "2rem" }}>🔧</span>
            <span style={{ fontWeight: 800, fontSize: "1rem" }}>מוסך</span>
          </button>
        </div>
      </div>

      {/* Step 2: Details — only shown after type selection */}
      {customerType !== null && (
        <>
          {/* Name */}
          <div>
            <label style={labelStyle} htmlFor="order-name">
              {customerType === "garage" ? "שם המוסך" : "שם מלא"}
            </label>
            <input
              id="order-name"
              type="text"
              style={inputStyle}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={customerType === "garage" ? "מוסך הכרמל" : "ישראל ישראלי"}
              autoComplete="name"
              autoFocus
            />
          </div>

          {/* Phone */}
          <div>
            <label style={labelStyle} htmlFor="order-phone">טלפון</label>
            <input
              id="order-phone"
              type="tel"
              style={inputStyle}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="050-1234567"
              autoComplete="tel"
              inputMode="tel"
            />
          </div>

          {/* Vehicle — show selected or ask manually */}
          {vehicle ? (
            <div style={{
              padding: "12px 16px",
              background: "rgba(255,196,36,0.08)",
              border: "1px solid var(--accent)",
              borderRadius: "var(--radius-sm)",
              fontSize: "0.9rem",
              color: "var(--accent)",
              fontWeight: 700,
            }}>
              🚗 {vehicleLabel}
            </div>
          ) : (
            <div>
              <label style={labelStyle}>פרטי רכב</label>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  type="text"
                  style={{ ...inputStyle, flex: 2 }}
                  value={manualMake}
                  onChange={(e) => setManualMake(e.target.value)}
                  placeholder="יצרן (טויוטה)"
                  list="makes-list"
                />
                <input
                  type="text"
                  style={{ ...inputStyle, flex: 2 }}
                  value={manualModel}
                  onChange={(e) => setManualModel(e.target.value)}
                  placeholder="דגם (קורולה)"
                />
                <input
                  type="text"
                  style={{ ...inputStyle, flex: 1 }}
                  value={manualYear}
                  onChange={(e) => setManualYear(e.target.value)}
                  placeholder="שנה"
                  inputMode="numeric"
                  maxLength={4}
                />
              </div>
              <datalist id="makes-list">
                {[...new Set(vehicles.map((v) => v.makeName.he))].map((name) => (
                  <option key={name} value={name} />
                ))}
              </datalist>
            </div>
          )}

          {/* WhatsApp submit button */}
          <a
            href={canSubmit ? buildWhatsAppUrl() : undefined}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => { if (!canSubmit) e.preventDefault(); }}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              background: canSubmit ? "#25D366" : "var(--surface-2)",
              color: canSubmit ? "#fff" : "var(--text-dim)",
              border: "none",
              borderRadius: "var(--radius-sm)",
              padding: "16px 24px",
              fontSize: "1.1rem",
              fontWeight: 800,
              cursor: canSubmit ? "pointer" : "not-allowed",
              textDecoration: "none",
              width: "100%",
              transition: "all 0.15s",
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            שלח הזמנה בוואטסאפ
          </a>

          <p style={{ fontSize: "0.75rem", color: "var(--text-dim)", textAlign: "center", marginTop: -8 }}>
            ההזמנה תישלח ישירות לוואטסאפ של אבו אמין חלפים
          </p>
        </>
      )}
    </div>
  );
}
