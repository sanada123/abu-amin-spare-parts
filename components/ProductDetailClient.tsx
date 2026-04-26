"use client";
import { useState } from "react";
import Link from "next/link";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { tr } from "@/lib/i18n";
import { useActiveVehicleId, addToCart } from "@/lib/cart";
import { STORE, whatsappUrl } from "@/lib/store-config";
import type { SkuDetail, CategoryData } from "@/lib/queries";

// Explicitly typed product for the detail page so sku fields are fully available
interface ProductDetailFull {
  id: number;
  slug: string;
  name: string;
  description: string | null;
  images: string[];
  category: { name: string };
  skus: SkuDetail[];
  fitments: { vehicle: { make: string; model: string; makeHe?: string; modelHe?: string; year: number; engine?: string } }[];
}

interface Props {
  product: ProductDetailFull;
}

export default function ProductDetailClient({ product }: Props) {
  const activeVehicleId = useActiveVehicleId();
  const [selectedSkuId, setSelectedSkuId] = useState<number | null>(
    product.skus[0]?.id ?? null
  );
  const [added, setAdded] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [fitsExpanded, setFitsExpanded] = useState(false);

  const sku = product.skus.find((s) => s.id === selectedSkuId) ?? product.skus[0];

  // Build fitment list grouped by make+model with year range
  const fitmentGroups: { makeHe: string; modelHe: string; years: number[] }[] = [];
  const groupMap = new Map<string, { makeHe: string; modelHe: string; years: number[] }>();

  for (const f of product.fitments) {
    const v = f.vehicle;
    const makeHe = v.makeHe ?? v.make;
    const modelHe = v.modelHe ?? v.model;
    const key = `${v.make}-${v.model}`;
    if (!groupMap.has(key)) {
      groupMap.set(key, { makeHe, modelHe, years: [] });
    }
    groupMap.get(key)!.years.push(v.year);
  }
  groupMap.forEach((val) => fitmentGroups.push(val));

  const fitmentLabels = fitmentGroups.map(({ makeHe, modelHe, years }) => {
    const minY = Math.min(...years);
    const maxY = Math.max(...years);
    return `${makeHe} ${modelHe} ${minY === maxY ? minY : `${minY}–${maxY}`}`;
  });

  // WhatsApp link
  const firstFitVehicle = product.fitments[0]?.vehicle;
  const vehicleLabel = firstFitVehicle
    ? `${firstFitVehicle.year} ${firstFitVehicle.make} ${firstFitVehicle.model}${firstFitVehicle.engine ? ` ${firstFitVehicle.engine}` : ""}`
    : "";
  const waText = `שלום, אני מעוניין ב: ${product.name}${sku ? ` (${sku.partNumber})` : ""}${vehicleLabel ? ` לרכב ${vehicleLabel}` : ""}`;
  const waHref = whatsappUrl(waText);

  const imageSrc =
    product.images.length > 0
      ? product.images[selectedImageIdx]
      : `/parts/${product.slug}.svg`;

  const handleAdd = () => {
    if (!sku) return;
    addToCart({ partId: product.id, skuId: sku.id, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <main>
      <section>
        <div style={{ marginBottom: 18 }}>
          <Link href="/catalog" style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>
            ← {tr("back")}
          </Link>
        </div>
        <div className="product-layout">
          {/* Images */}
          <div className="product-image-wrap">
            {product.images.length > 1 ? (
              <div>
                <img src={imageSrc} alt={product.name} />
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {product.images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageIdx(i)}
                      style={{
                        width: 56,
                        height: 56,
                        padding: 3,
                        border: selectedImageIdx === i ? "2px solid var(--accent)" : "1px solid var(--border)",
                        borderRadius: "var(--radius-sm)",
                        background: "var(--surface-2)",
                        cursor: "pointer",
                        overflow: "hidden",
                        flexShrink: 0,
                      }}
                      aria-label={`תמונה ${i + 1}`}
                    >
                      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <img src={imageSrc} alt={product.name} />
            )}
          </div>

          {/* Info */}
          <div className="product-info">
            <h1>{product.name}</h1>

            {!activeVehicleId && (
              <div className="fitment-badge" style={{ background: "rgba(245,158,11,0.12)", color: "var(--yellow)", borderColor: "rgba(245,158,11,0.3)" }}>
                ⚠️ <Link href="/vehicle" style={{ color: "var(--yellow)", textDecoration: "underline" }}>{tr("cta_select_vehicle")}</Link>
              </div>
            )}

            <div style={{ fontSize: "0.85rem", color: "var(--text-2)", fontWeight: 700, marginBottom: 12 }}>
              {tr("brand_label")}:
            </div>

            {/* SKU selector */}
            <div className="brand-options">
              {product.skus.map((s) => {
                const isLow = s.stock > 0 && s.stock < 10;
                const isSelected = s.id === selectedSkuId;
                return (
                  <div
                    key={s.id}
                    className={`brand-option ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedSkuId(s.id)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="brand-flag">{s.brand.country ?? ""}</div>
                    <div className="brand-info">
                      <div className="name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {s.brand.name}
                        <span style={{
                          fontSize: "0.6rem",
                          fontWeight: 700,
                          padding: "1px 5px",
                          borderRadius: 3,
                          background: s.tier === "original" ? "rgba(234,179,8,0.15)" : "var(--surface-3)",
                          color: s.tier === "original" ? "#b45309" : "var(--text-dim)",
                          border: s.tier === "original" ? "1px solid rgba(234,179,8,0.4)" : "1px solid var(--border)",
                        }}>
                          {s.tier === "original" ? "מקורי" : "חליפי"}
                        </span>
                      </div>
                      <div className="pn">{s.partNumber}</div>
                    </div>
                    <div className="brand-price-col">
                      <div className="price">₪{s.priceIls}</div>
                      <div className={`stock ${isLow ? "low" : ""}`}>
                        {s.stock === 0
                          ? "אזל מהמלאי"
                          : isLow
                          ? `נותרו ${s.stock}`
                          : tr("in_stock")}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery estimate */}
            {sku && (
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: sku.stock === 0 ? "var(--out-of-stock)" : "var(--success)", marginBottom: 4 }}>
                {sku.stock === 0
                  ? "❌ אזל מהמלאי"
                  : sku.deliveryDays === 1
                  ? "📦 במלאי · משלוח מחר"
                  : "📦 מלאי מוגבל · 3 ימי עסקים"}
              </div>
            )}

            {/* Add to order */}
            <button
              className="add-cart-btn"
              onClick={handleAdd}
              disabled={sku?.stock === 0}
              style={sku?.stock === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
              aria-live="polite"
            >
              {sku?.stock === 0
                ? "אזל מהמלאי"
                : added
                ? "✓ נוסף להזמנה!"
                : `${tr("add_to_cart")} — ₪${sku?.priceIls}`}
            </button>
            {sku?.stock === 0 && (
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", textAlign: "center", margin: "4px 0 0" }}>
                הודיעו לי כשחוזר
              </p>
            )}

            {/* WhatsApp */}
            <a
              href={waHref}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginTop: 10,
                background: "#25D366",
                color: "#fff",
                border: "none",
                borderRadius: "var(--radius-sm)",
                padding: "13px 20px",
                fontSize: "0.95rem",
                fontWeight: 700,
                textDecoration: "none",
                cursor: "pointer",
              }}
              aria-label={tr("whatsapp_send")}
            >
              <MessageCircle size={18} aria-hidden="true" />
              {tr("whatsapp_send")}
            </a>

            {/* Trust & Shipping */}
            <div style={{ marginTop: 16, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
              {[
                `✓ אחריות ${sku?.warrantyMonths ?? "—"} חודשים מיצרן`,
                "✓ משלוח לכל הארץ תוך 1–3 ימי עסקים",
                "✓ איסוף עצמי זמין במחסן בעוספיא",
                "✓ החזרה תוך 14 יום לפי חוק הגנת הצרכן",
              ].map((line, i, arr) => (
                <div
                  key={i}
                  style={{
                    padding: "9px 14px",
                    fontSize: "0.82rem",
                    color: "var(--text-2)",
                    borderBottom: i < arr.length - 1 ? "1px solid var(--border)" : "none",
                    background: i % 2 === 0 ? "var(--surface)" : "var(--surface-2)",
                  }}
                >
                  {line}
                </div>
              ))}
            </div>

            {/* Description */}
            {product.description && (
              <div style={{ marginTop: 16, fontSize: "0.88rem", color: "var(--text-2)", lineHeight: 1.6 }}>
                {product.description}
              </div>
            )}

            {/* Fits Also — collapsible */}
            {fitmentLabels.length > 0 && (
              <div style={{ marginTop: 16, border: "1px solid var(--border)", borderRadius: "var(--radius-sm)", overflow: "hidden" }}>
                <button
                  onClick={() => setFitsExpanded((v) => !v)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "12px 16px",
                    background: "var(--surface-2)",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    color: "var(--text)",
                  }}
                  aria-expanded={fitsExpanded}
                >
                  <span>מתאים גם ל: ({product.fitments.length})</span>
                  {fitsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
                {fitsExpanded && (
                  <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                    {fitmentLabels.map((label, i) => (
                      <div key={i} style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>
                        {label}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
