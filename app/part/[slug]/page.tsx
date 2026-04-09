"use client";
import { useState, use } from "react";
import Link from "next/link";
import { MessageCircle, ChevronDown, ChevronUp } from "lucide-react";
import { getPartBySlug, getCategory, getBrand, getVehicle, partImageUrl } from "@/lib/data";
import { tr } from "@/lib/i18n";
import { useLocale, useActiveVehicleId, addToCart } from "@/lib/cart";
import { notFound } from "next/navigation";

export default function PartPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const locale = useLocale();
  const activeVehicleId = useActiveVehicleId();
  const part = getPartBySlug(slug);
  const [selectedSku, setSelectedSku] = useState<number | null>(part?.skus[0]?.id ?? null);
  const [added, setAdded] = useState(false);
  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [fitsExpanded, setFitsExpanded] = useState(false);

  if (!part) return notFound();

  const cat = getCategory(part.categoryId);
  const vehicle = activeVehicleId ? getVehicle(activeVehicleId) : null;
  const fitsActive = activeVehicleId && part.fitsVehicleIds.includes(activeVehicleId);
  const sku = part.skus.find((s) => s.id === selectedSku) ?? part.skus[0];

  const WA_NUMBER = "972523158796";
  const vehicleLabel = vehicle
    ? `${vehicle.year} ${vehicle.makeName.he} ${vehicle.modelName.he} ${vehicle.engine}`
    : "";
  const waText = `שלום, אני מעוניין ב: ${part.name.he}${sku ? ` (${sku.partNumber})` : ""}${vehicleLabel ? ` לרכב ${vehicleLabel}` : ""}`;
  const waHref = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(waText)}`;

  const handleAdd = () => {
    if (!sku) return;
    addToCart({ partId: part.id, skuId: sku.id, qty: 1 });
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  return (
    <main>
      <section>
        <div style={{ marginBottom: 18 }}>
          <Link href="/catalog" style={{ color: "var(--text-3)", fontSize: "0.85rem" }}>
            ← {tr("back", locale)}
          </Link>
        </div>
        <div className="product-layout">
          <div className="product-image-wrap">
            {part.images && part.images.length > 1 ? (
              <div>
                <img src={part.images[selectedImageIdx]} alt={part.name.he} />
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  {part.images.map((src, i) => (
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
              <img src={partImageUrl(part)} alt={part.name.he} />
            )}
          </div>
          <div className="product-info">
            <h1>{part.name.he}</h1>
            <div className="product-oem">
              {part.oemNumbers.length > 0 && (
                <>
                  {tr("oem_label", locale)}:{" "}
                  {part.oemNumbers.map((o, i) => (
                    <code key={i} style={{ marginInlineEnd: 6 }}>{o}</code>
                  ))}
                </>
              )}
            </div>
            {fitsActive && vehicle && (
              <div className="fitment-badge">
                {tr("fitment_badge_prefix")} {vehicle.year} {vehicle.makeName.he} {vehicle.modelName.he} {vehicle.engine}
              </div>
            )}
            {!activeVehicleId && (
              <div className="fitment-badge" style={{ background: "rgba(245,158,11,0.12)", color: "var(--yellow)", borderColor: "rgba(245,158,11,0.3)" }}>
                ⚠️ <Link href="/vehicle" style={{ color: "var(--yellow)", textDecoration: "underline" }}>{tr("cta_select_vehicle", locale)}</Link>
              </div>
            )}

            <div style={{ fontSize: "0.85rem", color: "var(--text-2)", fontWeight: 700, marginBottom: 12 }}>
              {tr("brand_label", locale)}:
            </div>
            <div className="brand-options">
              {part.skus.map((s) => {
                const b = getBrand(s.brandId)!;
                const isLow = s.stock < 10;
                return (
                  <div
                    key={s.id}
                    className={`brand-option ${selectedSku === s.id ? "selected" : ""}`}
                    onClick={() => setSelectedSku(s.id)}
                  >
                    <div className="brand-flag">{b.logo}</div>
                    <div className="brand-info">
                      <div className="name" style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {b.name}
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
                        {isLow
                          ? `נותרו ${s.stock}`
                          : tr("in_stock", locale)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Delivery estimate for selected SKU */}
            {sku && (
              <div style={{ fontSize: "0.85rem", fontWeight: 600, color: sku.stock === 0 ? "var(--out-of-stock)" : "var(--success)", marginBottom: 4 }}>
                {sku.stock === 0
                  ? "❌ אזל מהמלאי"
                  : sku.deliveryDays === 1
                  ? "📦 במלאי · משלוח מחר"
                  : "📦 מלאי מוגבל · 3 ימי עסקים"}
              </div>
            )}

            {/* Primary action: Add to order */}
            <button
              className="add-cart-btn"
              onClick={handleAdd}
              disabled={sku?.stock === 0}
              style={sku?.stock === 0 ? { opacity: 0.5, cursor: "not-allowed" } : undefined}
            >
              {sku?.stock === 0
                ? "אזל מהמלאי"
                : added
                ? "✓ נוסף להזמנה!"
                : `${tr("add_to_cart", locale)} — ₪${sku?.priceIls}`}
            </button>
            {sku?.stock === 0 && (
              <p style={{ fontSize: "0.78rem", color: "var(--text-dim)", textAlign: "center", margin: "4px 0 0" }}>
                {"הודיעו לי כשחוזר"}
              </p>
            )}

            {/* Secondary: WhatsApp inline */}
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
              aria-label={tr("whatsapp_send", locale)}
            >
              <MessageCircle size={18} aria-hidden="true" />
              {tr("whatsapp_send", locale)}
            </a>

            {/* Trust & Shipping */}
            <div style={{
              marginTop: 16,
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              overflow: "hidden",
            }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
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
            </div>

            {Object.keys(part.specs).length > 0 && (
              <div className="specs-table">
                <h3 style={{ margin: "0 0 12px", fontSize: "0.95rem" }}>{tr("specs", locale)}</h3>
                {Object.entries(part.specs).map(([k, v]) => (
                  <div key={k} className="row">
                    <span className="k">{k}</span>
                    <span className="v">{v}</span>
                  </div>
                ))}
                <div className="row">
                  <span className="k">{tr("warranty", locale)}</span>
                  <span className="v">{sku?.warrantyMonths} {tr("months", locale)}</span>
                </div>
              </div>
            )}

            {part.installVideoId && (
              <div style={{ marginTop: 24 }}>
                <h3 style={{ margin: "0 0 12px", fontSize: "0.95rem" }}>📺 {tr("install_video", locale)}</h3>
                <div style={{ background: "var(--bg-3)", border: "1px solid var(--border)", borderRadius: 14, padding: 24, textAlign: "center", color: "var(--text-3)" }}>
                  "סרטון התקנה זמין" ▶
                </div>
              </div>
            )}

            {/* Fits Also — collapsible vehicle list */}
            {part.fitsVehicleIds.length > 0 && (() => {
              // Group by make+model, collect year range
              const grouped: Record<string, { makeHe: string; modelHe: string; years: number[] }> = {};
              part.fitsVehicleIds.forEach((vid) => {
                const v = getVehicle(vid);
                if (!v) return;
                const key = `${v.makeSlug}-${v.modelSlug}`;
                if (!grouped[key]) grouped[key] = { makeHe: v.makeName.he, modelHe: v.modelName.he, years: [] };
                grouped[key].years.push(v.year);
              });
              const entries = Object.values(grouped).map(({ makeHe, modelHe, years }) => {
                const minY = Math.min(...years);
                const maxY = Math.max(...years);
                return `${makeHe} ${modelHe} ${minY === maxY ? minY : `${minY}–${maxY}`}`;
              });
              return (
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
                    <span>{"מתאים גם ל:"} ({part.fitsVehicleIds.length})</span>
                    {fitsExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  {fitsExpanded && (
                    <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 6 }}>
                      {entries.map((label, i) => (
                        <div key={i} style={{ fontSize: "0.82rem", color: "var(--text-2)" }}>
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      </section>
    </main>
  );
}
