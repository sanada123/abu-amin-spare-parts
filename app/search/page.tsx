"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { searchParts, getCategory, getBrand, minPriceForPart } from "@/lib/data";
import { tr } from "@/lib/i18n";
import { useLocale, useActiveVehicleId } from "@/lib/cart";

function SearchInner() {
  const locale = useLocale();
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const activeVehicleId = useActiveVehicleId();
  const results = searchParts(q, activeVehicleId ?? undefined);

  return (
    <main>
      <section>
        <div className="section-head">
          <h2>
            {locale === "en" ? "Search results" : locale === "ar" ? "نتائج البحث" : "תוצאות חיפוש"}
            <span style={{ color: "var(--text-3)", fontWeight: 600, marginInlineStart: 10 }}>
              "{q}" — {results.length}
            </span>
          </h2>
        </div>
        {results.length === 0 ? (
          <div className="empty">
            <div className="emoji">🔍</div>
            <h3>{locale === "en" ? "No results" : locale === "ar" ? "لا توجد نتائج" : "אין תוצאות"}</h3>
            <p>{locale === "en" ? "Try a different search term or OEM number" : locale === "ar" ? "جرب كلمة بحث أخرى أو رقم OEM" : "נסה מילת חיפוש אחרת או מספר OEM"}</p>
          </div>
        ) : (
          <div className="parts-grid">
            {results.map((p) => {
              const cat = getCategory(p.categoryId);
              const minP = minPriceForPart(p);
              const fits = activeVehicleId && p.fitsVehicleIds.includes(activeVehicleId);
              return (
                <Link key={p.id} href={`/part/${p.slug}`} className="part-card">
                  <div className="part-img">{cat?.icon ?? "🔧"}</div>
                  {fits && <span className="part-fitment">{tr("fits_your_car", locale)}</span>}
                  <div className="part-name">{p.name[locale]}</div>
                  <div className="part-brands">
                    {p.skus.slice(0, 3).map((s) => getBrand(s.brandId)?.name).filter(Boolean).join(" · ")}
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

export default function SearchPage() {
  return (
    <Suspense fallback={<main><section><h2>...</h2></section></main>}>
      <SearchInner />
    </Suspense>
  );
}
