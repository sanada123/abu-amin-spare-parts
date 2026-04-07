"use client";
import { useState, use } from "react";
import Link from "next/link";
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

  if (!part) return notFound();

  const cat = getCategory(part.categoryId);
  const vehicle = activeVehicleId ? getVehicle(activeVehicleId) : null;
  const fitsActive = activeVehicleId && part.fitsVehicleIds.includes(activeVehicleId);
  const sku = part.skus.find((s) => s.id === selectedSku) ?? part.skus[0];

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
            <img src={partImageUrl(part)} alt={part.name[locale]} />
          </div>
          <div className="product-info">
            <h1>{part.name[locale]}</h1>
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
                {tr("fitment_badge_prefix", locale)} {vehicle.year} {vehicle.makeName[locale]} {vehicle.modelName[locale]} {vehicle.engine}
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
                      <div className="name">{b.name}</div>
                      <div className="pn">{s.partNumber}</div>
                    </div>
                    <div className="brand-price-col">
                      <div className="price">₪{s.priceIls}</div>
                      <div className={`stock ${isLow ? "low" : ""}`}>
                        {isLow
                          ? (locale === "en" ? `Only ${s.stock} left` : locale === "ar" ? `${s.stock} متبقي فقط` : `נותרו ${s.stock}`)
                          : tr("in_stock", locale)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <button className="add-cart-btn" onClick={handleAdd}>
              {added ? "✓ " + (locale === "en" ? "Added!" : locale === "ar" ? "أضيف!" : "נוסף!") : tr("add_to_cart", locale) + ` — ₪${sku?.priceIls}`}
            </button>

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
                  {locale === "en" ? "Installation video available" : locale === "ar" ? "فيديو التركيب متاح" : "סרטון התקנה זמין"} ▶
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
