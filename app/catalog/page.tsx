"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import {
  categories, parts, getCategoryBySlug, getBrand,
  minPriceForPart, partsForVehicle, getVehicle, partImageUrl,
} from "@/lib/data";
import { tr } from "@/lib/i18n";
import { useLocale, useActiveVehicleId, setActiveVehicleId } from "@/lib/cart";

function CatalogInner() {
  const locale = useLocale();
  const activeVehicleId = useActiveVehicleId();
  const sp = useSearchParams();
  const catSlug = sp.get("cat");
  const cat = catSlug ? getCategoryBySlug(catSlug) : null;

  // Always show all parts — filter by vehicle only when one is selected
  let visible = cat ? parts.filter((p) => p.categoryId === cat.id) : parts;
  if (activeVehicleId) {
    visible = partsForVehicle(activeVehicleId, cat?.id);
  }

  const vehicle = activeVehicleId ? getVehicle(activeVehicleId) : null;

  return (
    <main>
      {/* Vehicle filter bar */}
      {vehicle && (
        <div style={{ background: "#fff8dc", borderBottom: "2px solid #FFD700", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <span style={{ fontSize: "1rem" }}>🚗</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {locale === "he" ? "מסונן לפי:" : locale === "ar" ? "فلترة حسب:" : "Filtered for:"}{" "}
            {vehicle.year} {vehicle.makeName[locale]} {vehicle.modelName[locale]}
          </span>
          <button
            onClick={() => setActiveVehicleId(null)}
            style={{ background: "white", border: "1.5px solid #cc0000", color: "#cc0000", borderRadius: 8, padding: "5px 12px", cursor: "pointer", fontWeight: 700, fontSize: 13, marginInlineStart: "auto" }}
          >
            {locale === "he" ? "✕ הסר סינון" : locale === "ar" ? "✕ إزالة الفلتر" : "✕ Clear filter"}
          </button>
        </div>
      )}

      <section>
        <div className="section-head">
          <div>
            <h2>
              {cat ? cat.name[locale] : tr("popular_categories", locale)}
              <span className="underline"></span>
            </h2>
          </div>
          {cat && <Link href="/catalog">← {tr("view_all", locale)}</Link>}
        </div>

        {!cat && (
          <div className="cat-grid" style={{ marginBottom: 36 }}>
            {categories.map((c) => (
              <Link key={c.id} href={`/catalog?cat=${c.slug}`} className="cat-card">
                <span className="cat-icon">{c.icon}</span>
                <span className="cat-name">{c.name[locale]}</span>
              </Link>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <div className="empty">
            <div className="emoji">🔍</div>
            <h3>
              {locale === "en"
                ? "No parts found"
                : locale === "ar"
                ? "لم يتم العثور على قطع"
                : "לא נמצאו חלקים"}
            </h3>
            <p>
              {locale === "en"
                ? "Try changing your vehicle or category"
                : locale === "ar"
                ? "جرب تغيير السيارة أو الفئة"
                : "נסה לשנות את הרכב או הקטגוריה"}
            </p>
            <Link href="/vehicle" className="cta">
              {tr("change_vehicle", locale)}
            </Link>
          </div>
        ) : (
          <div className="parts-grid">
            {visible.map((p) => {
              const minP = minPriceForPart(p);
              const fitsActive =
                activeVehicleId && p.fitsVehicleIds.includes(activeVehicleId);
              return (
                <Link key={p.id} href={`/part/${p.slug}`} className="part-card">
                  <div className="part-img">
                    <img src={partImageUrl(p)} alt={p.name[locale]} loading="lazy" />
                  </div>
                  <div className="part-body">
                    {fitsActive && (
                      <span className="part-fitment">✓ {tr("fits_your_car", locale)}</span>
                    )}
                    <div className="part-name">{p.name[locale]}</div>
                    <div className="part-brands">
                      {p.skus
                        .slice(0, 3)
                        .map((s) => getBrand(s.brandId)?.name)
                        .filter(Boolean)
                        .join(" · ")}
                      {p.skus.length > 3 ? ` +${p.skus.length - 3}` : ""}
                    </div>
                    <div className="part-meta">
                      <div className="part-price">
                        ₪{minP} <small>{tr("from_price", locale)}</small>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

export default function CatalogPage() {
  return (
    <Suspense
      fallback={
        <main>
          <section>
            <h2>...</h2>
          </section>
        </main>
      }
    >
      <CatalogInner />
    </Suspense>
  );
}
