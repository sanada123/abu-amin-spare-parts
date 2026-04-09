"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { searchParts, getBrand, minPriceForPart, partImageUrl } from "@/lib/data";
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
            {"תוצאות חיפוש"}
            <span style={{ color: "var(--text-3)", fontWeight: 600, marginInlineStart: 10 }}>
              "{q}" — {results.length}
            </span>
          </h2>
        </div>
        {results.length === 0 ? (
          <div className="empty">
            <div className="emoji">🔍</div>
            <h3>{"אין תוצאות"}</h3>
            <p>{"נסה מילת חיפוש אחרת או מספר OEM"}</p>
          </div>
        ) : (
          <div className="parts-grid">
            {results.map((p) => {
              const minP = minPriceForPart(p);
              const fits = activeVehicleId && p.fitsVehicleIds.includes(activeVehicleId);
              return (
                <Link key={p.id} href={`/part/${p.slug}`} className="part-card">
                  <div className="part-img">
                    <img src={partImageUrl(p)} alt={p.name[locale]} loading="lazy" />
                  </div>
                  <div className="part-body">
                    {fits && <span className="part-fitment">✓ {tr("fits_your_car", locale)}</span>}
                    <div className="part-name">{p.name[locale]}</div>
                    <div className="part-brands">
                      {p.skus.slice(0, 3).map((s) => getBrand(s.brandId)?.name).filter(Boolean).join(" · ")}
                    </div>
                    <div className="part-meta">
                      <div className="part-price">₪{minP} <small>{tr("from_price", locale)}</small></div>
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

export default function SearchPage() {
  return (
    <Suspense fallback={<main><section><h2>...</h2></section></main>}>
      <SearchInner />
    </Suspense>
  );
}
