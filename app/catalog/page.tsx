"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { categories, parts, getCategory, getCategoryBySlug, getBrand, minPriceForPart, partsForVehicle, getVehicle } from "@/lib/data";
import { tr } from "@/lib/i18n";
import { useLocale, useActiveVehicleId } from "@/lib/cart";

function CatalogInner() {
  const locale = useLocale();
  const activeVehicleId = useActiveVehicleId();
  const sp = useSearchParams();
  const catSlug = sp.get("cat");
  const cat = catSlug ? getCategoryBySlug(catSlug) : null;

  let visible = parts;
  if (activeVehicleId) {
    visible = partsForVehicle(activeVehicleId, cat?.id);
  } else if (cat) {
    visible = parts.filter((p) => p.categoryId === cat.id);
  }

  const vehicle = activeVehicleId ? getVehicle(activeVehicleId) : null;

  return (
    <main>
      <section>
        <div className="section-head">
          <div>
            <h2>
              {cat ? cat.name[locale] : tr("popular_categories", locale)}
              {vehicle && (
                <span style={{ fontSize: "0.6em", color: "var(--text-2)", fontWeight: 600, marginInlineStart: 12 }}>
                  · {vehicle.year} {vehicle.makeName[locale]} {vehicle.modelName[locale]}
                </span>
              )}
            </h2>
          </div>
          {cat && <Link href="/catalog">← {tr("view_all", locale)}</Link>}
        </div>

        {!cat && (
          <div className="cat-grid" style={{ marginBottom: 32 }}>
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
            <h3>{locale === "en" ? "No parts found" : locale === "ar" ? "لم يتم العثور على قطع" : "לא נמצאו חלקים"}</h3>
            <p>{locale === "en" ? "Try changing your vehicle or category" : locale === "ar" ? "جرب تغيير السيارة أو الفئة" : "נסה לשנות את הרכב או הקטגוריה"}</p>
            <Link href="/vehicle" className="cta">{tr("change_vehicle", locale)}</Link>
          </div>
        ) : (
          <div className="parts-grid">
            {visible.map((p) => {
              const c = getCategory(p.categoryId);
              const minP = minPriceForPart(p);
              const fitsActive = activeVehicleId && p.fitsVehicleIds.includes(activeVehicleId);
              return (
                <Link key={p.id} href={`/part/${p.slug}`} className="part-card">
                  <div className="part-img">{c?.icon ?? "🔧"}</div>
                  {fitsActive && <span className="part-fitment">{tr("fits_your_car", locale)}</span>}
                  <div className="part-name">{p.name[locale]}</div>
                  <div className="part-brands">
                    {p.skus.slice(0, 3).map((s) => getBrand(s.brandId)?.name).filter(Boolean).join(" · ")}
                    {p.skus.length > 3 ? ` +${p.skus.length - 3}` : ""}
                  </div>
                  <div className="part-meta">
                    <div className="part-price">₪{minP} <small>{tr("from_price", locale)}</small></div>
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
    <Suspense fallback={<main><section><h2>...</h2></section></main>}>
      <CatalogInner />
    </Suspense>
  );
}
